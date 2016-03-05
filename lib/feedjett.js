/**********************************************************************
 node-feedjett - A fast and robust RSS, Atom, RDF parser for nodejs.

 This project was inspired by node-feedparser and uses alot of the same
 functionality, theories, and code with the addition of new features and
 enhancements.
 http://github.com/djett41/node-feedjett

 **********************************************************************/
/*jshint sub:true */
var sax = require('sax'),
    util = require('util'),
    TransformStream = require('readable-stream').Transform,
    parser = require('./parser'),
    _ = require('lodash'),
    utils = require('./utils');

var normalizedProps = {
  meta: ['title','description','link','pubDate','updatedDate','categories','author','image','xmlUrl','language','icon','copyright','generator','updateInfo','cloud'],
  item: ['title','description','link','pubDate','updatedDate','categories','author','image','content','guid','origLink','comments','commentRss','enclosures','source']
};

var propertyParserMap = {
  title: 'parseTitle',
  description: 'parseDescription',
  link: 'parseLink',
  updatedDate: 'parseUpdatedDate',
  pubDate: 'parsePubDate',
  categories: 'parseCategories',
  author: 'parseAuthor',
  image: 'parseImage',
  xmlUrl: 'parseXmlUrl',
  origLink: 'parseOrigLink',
  language: 'parseLanguage',
  icon: 'parseIcon',
  copyright: 'parseCopyright',
  generator: 'parseGenerator',
  cloud: 'parseCloud',
  comments: 'parseComments',
  commentRss: 'parseCommentRss',
  updateInfo: 'parseUpdateInfo',
  enclosures: 'parseEnclosures',
  guid: 'parseGuid',
  source: 'parseSource',
  content: 'parseContent'
};


/**
 * FeedJett constructor. Most apps will only use one instance.
 *
 * Exposes a duplex (transform) stream to parse a feed.
 */
function FeedJett (options) {
  if (!(this instanceof FeedJett)) {
    return new FeedJett(options);
  }

  TransformStream.call(this);
  this._readableState.objectMode = true;
  this._readableState.highWaterMark = 16; // max. # of output nodes buffered

  this.init();
  this.parseOptions(options);

  sax.MAX_BUFFER_LENGTH = this.options.MAX_BUFFER_LENGTH;
  this.stream = sax.createStream(this.options.strict, {lowercase: true, xmlns: true });
  this.stream.on('processinginstruction', this.onProcessingInstruction.bind(this));
  this.stream.on('attribute', this.onAttribute.bind(this));
  this.stream.on('opentag', this.onOpenTag.bind(this));
  this.stream.on('closetag',this.onCloseTag.bind(this));
  this.stream.on('text', this.onText.bind(this));
  this.stream.on('cdata', this.onText.bind(this));
  this.stream.on('end', this.onEnd.bind(this));
  this.stream.on('error', this.onSaxError.bind(this));
}
util.inherits(FeedJett, TransformStream);

/**
 * Initializes the class-variables
 */
FeedJett.prototype.init = function () {
  this.meta = { '#ns': [], '@': [], '#xml': {} };
  this.isMetaParsed = false;
  this.stack = [];
  this.xmlBase = [];
  this.itemCount = 0;
  this.xhtml = null;
};

/**
 * Merges options with default options
 *
 * @param options
 */
FeedJett.prototype.parseOptions = function (options) {
  this.options = _.assign({
    strict: false,
    normalize: true,
    resumeOnSaxError: true,
    MAX_BUFFER_LENGTH: (16 * 1024 * 1024),
    addMeta: true,
    parseMeta: true,
    parseRawNode: false
  }, options);

  if (this.options.feedUrl) {
    this.xmlBase.unshift({ '#name': 'xml', '#': this.options.feedUrl});
  }

  if (this.options.normalize) {
    this.options.blackList = utils.strArrayToObj(this.options.blackList);
    this.options.whiteList = utils.strArrayToObj(this.options.whiteList);
    this.enabledProps = this.setEnabledProps();
  }
};

/**
 * Merges custom properties with default normalized properties and constructs an object that only contains enabled
 * properties for item and meta
 *
 * @returns {*}
 */
FeedJett.prototype.setEnabledProps = function () {
  return ['meta', 'item'].reduce(function (obj, type) {
    var props = normalizedProps[type];

    if (this.options.whiteList || this.options.blackList) {
      props = props.filter(function (prop) {
        return this.isPropEnabled(prop);
      }, this);
    }
    obj[type] = props;
    return obj;
  }.bind(this), {});
};

/**
 * Determines whether or not a property is enabled by checking the whitelist/blacklist
 * @param prop
 * @returns {boolean}
 */
FeedJett.prototype.isPropEnabled = function (prop) {
  if (this.options.whiteList) {
    return !!this.options.whiteList[prop];
  } else if (this.options.blackList) {
    return !this.options.blackList[prop];
  }
  return true;
};

/**
 * Parses the <?xml tag and sets its attributes in meta['#xml']
 * @param node
 */
FeedJett.prototype.onProcessingInstruction = function (node) {
  if (node.name !== 'xml') {
    return;
  }

  this.meta['#xml'] = node.body.trim().split(' ').reduce(function (map, attr) {
    var parts = attr.split('=');
    var val = parts[1];
    map[parts[0]] = val && val.length > 2 && val.match(/^.(.*?).$/)[1];
    return map;
  }, {});
};

/**
 * Invoked when sax parser emits an attribute event.  This function adds any xmlns prefixed attributes to the meta's
 * namespace property.  Additionally if a prefix and uri are defined and either the prefix doesn't match the "default"
 * prefix for the specified uri or if the uri is the default xml uri, then set the prefix as the default prefix for the
 * specified uri.  Then we construct a key based on the prefix and local attribute value.
 *
 * @param attr
 */
FeedJett.prototype.onAttribute = function (attr) {
  var namespace, prefix;

  if (this.isLimitReached()) {
   return;
  }

  //if prefix is xmlns, add it to the meta namespaces
  if (attr.prefix === 'xmlns') {
    namespace = {};
    namespace[attr.name] = attr.value;
    this.meta['#ns'].push(namespace);
  }

  // If the feed is using a non-default prefix, we'll use it, too But we force the use of the 'xml' prefix
  if (attr.uri && attr.prefix && !utils.nslookup(attr.uri, attr.prefix) || utils.nslookup(attr.uri, 'xml')) {
    prefix = utils.nsprefix(attr.uri) || attr.prefix;
  }
  attr.key = (prefix && attr.local) ? (prefix + ':' + attr.local)  : (prefix || attr.local);
};

/**
 * Converts the sax attributes object to simplified key/value pairs.  Relies on the key property created in
 * onAttribute as the attribute key.  This function will also resolve any relative URL's, parse xml:base, and
 * mark a tag as XHTML, which is handled differently in onCloseTag
 *
 * @param attrs
 * @param tagName
 * @param baseUrl
 * @returns {*}
 */
FeedJett.prototype.simplifyAttributes = function (attrs, tagName) {
  var baseUrl = this.xmlBase.length && this.xmlBase[0]['#'];

  return Object.keys(attrs).reduce(function(obj, key) {
    var attr = attrs[key];

    // Apply xml:base to the following attributes
    if (baseUrl && (attr.local === 'href' || attr.local === 'src' || attr.local === 'uri')) {
      attr.value = utils.resolve(baseUrl, attr.value);
    } else if (attr.local === 'base' && utils.nslookup(attr.uri, 'xml')) {
      if (baseUrl) {
        attr.value = utils.resolve(baseUrl, attr.value);
      }
      this.xmlBase.unshift({ '#name': tagName, '#': attr.value});
    } else if (attr.name === 'type' && (attr.value === 'xhtml' || attr.value === 'html')) {
      //create xhtml object which will be container for holding xhtml value until done
      this.xhtml = {'#name': tagName, '#': ''};
    }

    if (attr.key) {
      obj[attr.key] = attr.value.trim();
    }
    return obj;
  }.bind(this), {});
};

/**
 * Parses the open tag and simplifies it's attributes.  This is also where the feed meta data is parsed
 *
 * @param node
 */
FeedJett.prototype.onOpenTag = function (node) {
  if (this.isLimitReached()) {
    return;
  }

  var newNode = {'#': '', '#prefix': node.prefix},
      tagName = newNode['#name'] = node.name,
      local = newNode['#local'] = node.local,
      uri = newNode['#uri'] = node.uri,
      attrs = newNode['@'] = this.simplifyAttributes(node.attributes, tagName);

  if (this.xhtml && this.xhtml['#name'] !== tagName) {
    this.xhtml['#'] += utils.createOpenTag(tagName, attrs);
  } else if (!this.stack.length) {
    //If feed is rss, atom, or rdf then set meta data, otherwise it's an invalid feed so we throw an error to stop parsing
    if (tagName === 'rss' || (local === 'feed' && utils.nslookup([uri], 'atom')) || (local === 'rdf' && utils.nslookup([uri], 'rdf'))) {
      this.meta['@'] = Object.keys(attrs).reduce(function (obj, key) {
        if (key !== 'version') {
          obj[key] = attrs[key];
        }
        return obj;
      }, {});

      switch(local) {
        case 'rss':
          this.meta['#type'] = 'rss';
          this.meta['#version'] = attrs.version;
          break;
        case 'rdf':
          this.meta['#type'] = 'rdf';
          this.meta['#version'] = attrs.version || '1.0';
          break;
        case 'feed':
          this.meta['#type'] = 'atom';
          this.meta['#version'] = attrs.version || '1.0';
          break;
      }
    } else {
      throw new Error('Invalid feed ' + (this.options.feedUrl || '') + '.  Expected type: rss, feed, or rdf.  Actual type: ' + tagName);
    }
  }

  this.stack.unshift(newNode);
};

/**
 * Parses the info of a node (name. prefix, local, type
 *
 * @param node
 * @param tagName
 */
FeedJett.prototype.getNodeInfo = function (tagName, uri, prefix, local) {
  var tagNameParts = tagName.split(':'), type;

  if (tagNameParts.length > 1 && tagNameParts[0] === prefix) {
    if (utils.nslookup(uri, 'atom')) {
      prefix = tagNameParts[0];
      type = 'atom';
    } else if (utils.nslookup(uri, 'rdf')) {
      prefix = tagNameParts[0];
      type = 'rdf';
    } else {
      prefix = utils.nsprefix(uri) || prefix;
    }
    local = tagNameParts.slice(1).join(':');
  } else {
    local = tagName;
    type = utils.nsprefix(uri) || prefix;
  }

  return { name: tagName, prefix: prefix, local: local, type: type };
};

/**
 * Handles the node when the tag is closed.  This is where all the heavy lifting is done.  Meta and item nodes are
 * parsed, while all other child nodes are placed on the stack so the item/meta nodes will have all the data available
 * when their tags close.
 *
 * NOTE: nodeInfo.type may not be the same as the meta feedType.
 *
 * @param tagName
 */
FeedJett.prototype.onCloseTag = function (tagName) {
  if (this.isLimitReached()) {
    return;
  }

  var node = this.stack.shift(),
      nodeInfo = this.getNodeInfo(tagName, node['#uri'], node['#prefix'], node['#local']),
      feedType = this.meta['#type'],
      item;

  //remove info properties from original node since we have nodeInfo now
  utils.removeProps(node, ['#name', '#local', '#prefix', '#uri']);

  if (this.xmlBase.length && tagName === this.xmlBase[0]['#name']) {
    void this.xmlBase.shift();
  }

  if (parser.isItemTag(tagName, nodeInfo.prefix, nodeInfo.local, nodeInfo.type)) {
    // We have an article!
    item = this.parseNode(node, 'item', feedType, this.options);

    if (this.options.parseMeta) {
      this.parseMeta(this.stack[0]);
      if (this.options.addMeta) {
        item.meta = this.meta;
      }
    }

    if (this.options.afterParseItem) {
      this.options.afterParseItem(item, feedType);
    }

    if ((this.options.isItemValid || parser.isItemValid)(item, this.meta['#type'])) {
      this.itemCount++;
      this.push(item);
    }
  } else if (this.options.parseMeta && parser.isChannelTag(tagName, nodeInfo.prefix, nodeInfo.local, nodeInfo.type)) {
    this.parseMeta(node);
  } else {
    //if an xmlBase url is available and the node has a logo or icon, resolve the URL
    if (this.xmlBase.length && this.xmlBase[0]['#'] && nodeInfo.type === 'atom' && (nodeInfo.local === 'logo' || nodeInfo.local === 'icon')) {
      node['#'] = utils.resolve(this.xmlBase[0]['#'], node['#']);
    }

    // first check to see if node is XHTML node
    if (this.xhtml) {
      //if the closing tag is the same tag that started parsing XHTML, reset the node with XHTML content, and clear this.xhtml
      if (tagName === this.xhtml['#name']) {
        node = {'#': this.xhtml['#'], '@': node['@']};
        this.xhtml = null;
      } else {
        this.xhtml['#'] += utils.createCloseTag(tagName);
        //no node to add to the stack since we are adding content to xhtml node so let's return.
        return;
      }
    }

    //Add the current node to it's parentNode on the stack by tagName so it can be parsed later
    if (this.stack.length) {
      var parentNode = this.stack[0];
      if (!parentNode[tagName]) {
        parentNode[tagName] = node;
      } else if (Array.isArray(parentNode[tagName])) {
        parentNode[tagName].push(node);
      } else {
        parentNode[tagName] = [parentNode[tagName], node];
      }
    }
  }
};

/**
 * handles text/cdata.  If currently parsing xhtml, the text is appended to the xhtml value, otherwise the text
 * property is set for the current node on the stack
 *
 * @param text
 */
FeedJett.prototype.onText = function (text) {
  if (this.isLimitReached()) {
    return;
  }

  var textNode = this.xhtml || (this.stack.length && this.stack[0]);
  if (textNode && !text.match(/^\s*$/)) {
    textNode['#'] += text.trim();
  }
};

/**
 * Creates an object that includes the parsed result of all enabled properties
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @param options
 * @returns {*}
 */
FeedJett.prototype.normalizeNode = function (node, nodeType, feedType, options) {
  return this.enabledProps[nodeType].reduce(function (obj, prop) {
    var parserFnName = propertyParserMap[prop];
    var value = (options[parserFnName] || parser[parserFnName])(node, nodeType, feedType);

    if (value) {
      obj[prop] = value;
    }
    return obj;
  }, {});
};

/**
 * Loops through all properties of a node and sets/overwrites any raw nodes that don't start with #
 *
 * @param node
 * @param feedType
 * @returns {*}
 */
FeedJett.prototype.parseRawNode = function (node, feedType) {
  return Object.keys(node).reduce(function(obj, name) {
    if (name.indexOf('#') !== 0) {
      var prop = ~name.indexOf(':') ? name : (feedType + ':' + name);
      obj[prop] = node[name];
    }
    return obj;
  }, {});
};

/**
 * Parses the meta object if it hasn't been parsed already and emits the meta event if not already emitted.
 *
 * @param node
 */
FeedJett.prototype.parseMeta = function (node) {
  if (!this.isMetaParsed) {
    _.assign(this.meta, this.parseNode(node, 'meta', this.meta['#type'], this.options));

    //fall back on feedUrl
    if (this.isPropEnabled('xmlUrl') && !this.meta.xmlUrl && this.options.feedUrl) {
      this.meta.xmlUrl = this.options.feedUrl;
    }

    if (this.options.afterParseMeta) {
      this.options.afterParseMeta(this.meta, this.meta['#type']);
    }

    if ((this.options.isMetaValid || parser.isMetaValid)(this.meta, this.meta['#type'])) {
      this.isMetaParsed = true;
      this.emit('meta', this.meta);
    }
  }
};

/**
 * parses a node into normalized and/or raw node depending on configuration
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @param options
 * @returns {*}
 */
FeedJett.prototype.parseNode = function (node, nodeType, feedType, options) {
  if (!feedType || !node) {
    return {};
  }

  var parsedNode = options.normalize ? this.normalizeNode(node, nodeType, feedType, options) : {};

  if (options.parseRawNode) {
    parsedNode.raw = this.parseRawNode(node, feedType);
  }
  return parsedNode;
};

/**
 * called when everything is finished
 */
FeedJett.prototype.onEnd = function () {
  this.push(null);
};

/**
 * handles sax errors, and resumes parsing if true
 * @param e
 */
FeedJett.prototype.onSaxError = function (e) {
  this.handleError(e);
  if (this.options.resumeOnSaxError) {
    this.resumeSaxError();
  }
};

/**
 * Clears the sax error and resumes sax parsing
 */
FeedJett.prototype.resumeSaxError = function () {
  if (this.stream._parser) {
    this.stream._parser.error = null;
    this.stream._parser.resume();
  }
};

/**
 * Emits an error
 *
 * @param e
 */
FeedJett.prototype.handleError = function (e) {
  this.emit('error', e);
};

/**
 * Called by internal Transform methods
 *
 * @param data
 * @param encoding
 * @param done
 * @private
 */
FeedJett.prototype._transform = function (data, encoding, done) {
  try {
    this.stream.write(data);
    done();
  }
  catch (e) {
    done(e);
    // Manually trigger and end, since we can't reliably do any more parsing
    this.onEnd();
  }
};

/**
 * Called by internal Transform methods
 *
 * @param done
 * @private
 */
FeedJett.prototype._flush = function (done) {
  try {
    this.stream.end();
    done();
  }
  catch (e) {
    done(e);
  }
};

/**
 * Checks if a limit has been reached
 *
 * @private
 */
FeedJett.prototype.isLimitReached = function () {
  if (this.options.itemLimit && this.itemCount >= this.options.itemLimit && !this.isEnding) {
    this.isEnding = true;
    this.end();
    return true;
  }
  return false;
};

/**
 * Dynamically allows you to parse a custom property.
 *
 * 1.  propName is added to all specified type arrays (meta or item) within normalizedProps
 * 2.  custom property is added to propertyParserMap {propName: parserName}
 * 3.  custom parser function is added to parser object
 *
 * @param propName
 * @param types (Array/string that must be either 'item', 'meta', or ['meta', 'item']
 * @param parserName
 * @param parserFn
 */
exports.addCustomParser = function (propName, types, parserName, parserFn) {
  if (arguments.length !== 4) {
    return console.log('You must pass in a property name, types (item|meta), parser name, and parser function');
  } else if (!Array.isArray(types)) {
    types = [types];
  }

  types.forEach(function (type) {
    normalizedProps[type].push(propName);
  });

  propertyParserMap[propName] = parserName;
  parser[parserName] = parserFn;
};


/**
 * replaces property names in normalized props (item and meta) and also updates parser function name mapping by
 * pointing new props at old prop parser function name.
 *
 * @param propMapping - ex {author: 'newAuthorKey', description: 'newDescriptionKey'}
 */
exports.overridePropNames = function (propMapping) {
  //replace property names in normalized props for item and meta
  Object.keys(normalizedProps).forEach(function (type) {
    var props = normalizedProps[type];
    var i = props.length;
    var originalKey;
    var newKey;

    while (i--) {
      originalKey = props[i];
      newKey = propMapping[originalKey];

      if (newKey) {
        props[i] = newKey;
      }
    }
  });

  //update parser function name mapping bu pointing new props at old prop parser function name
  Object.keys(propMapping).forEach(function (originalKey) {
    var newKey = propMapping[originalKey];
    var parserFnName = propertyParserMap[originalKey];

    if (parserFnName) {
      delete propertyParserMap[originalKey];
      propertyParserMap[newKey] = parserFnName;
    }
  });
};


/**
 * Creates a new instance of FeedJett
 * @param options
 * @returns {FeedJett}
 */
exports.createInstance = function (options) {
  return new FeedJett(options);
};

/**
 * Exposes the utils module
 */
exports.utils = utils;
