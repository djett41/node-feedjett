var utils = require('./utils'),
    addressparser = require('addressparser');

/**
 * Parses the most/recent updated date for meta and item nodes.
 *
 *  - lastbuilddate
 *    - most frequent in RSS feeds and meta nodes
 *  - a10:updated
 *    - infrequent but provides updated date in RSS in item nodes
 *  - updated
 *    - most frequent in ATOM feeds and meta and item nodes
 *  - modified
 *    - most frequent in RDF feeds in meta and item nodes
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseUpdatedDate (node, nodeType, feedType) {
  var propOrder;

  if (feedType === 'rss') {
    propOrder = nodeType === 'meta' ? ['lastbuilddate'] : ['a10:updated'];
  } else if (feedType === 'atom') {
    propOrder = ['updated'];
  } else if (feedType === 'rdf') {
    propOrder = ['modified'];
  }

  var dateString = utils.getFirstFoundPropValue(node, propOrder);

  if (dateString) {
    return utils.getDate(dateString);
  }
}
exports.parseUpdatedDate = parseUpdatedDate;

/**
 * Parses the most recent updated date for meta and item nodes.
 *
 *  - pubdate
 *    - most frequent in RSS feeds for meta and item nodes
 *  - published
 *    - most frequent in ATOM feeds and meta and item nodes
 *  - issued
 *    - most frequent in RDF feeds in meta and item nodes
 *  - dc:date
 *    - next priorit in ALL feeds for meta and item nodes
 *  - publisheddate
 *    - infrequent but sometimes exists in RSS feeds
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parsePubDate (node, nodeType, feedType) {
  var propOrder, dateString;

  if (feedType === 'rss') {
    propOrder = ['pubdate', 'dc:date', 'publisheddate'];
  } else if (feedType === 'atom') {
    propOrder = ['published', 'dc:date'];
  } else if (feedType === 'rdf') {
    propOrder = ['issued', 'dc:date'];
  }

  dateString = utils.getFirstFoundPropValue(node, propOrder);

  if (dateString) {
    return utils.getDate(dateString);
  }
}
exports.parsePubDate = parsePubDate;

/**
 * Parses the title of a meta or item node and strips HTML
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseTitle (node, nodeType, feedType) {
  return utils.stripHtml(utils.get(node.title));
}
exports.parseTitle = parseTitle;

/**
 * Parses the description of a meta or item node and strips HTML
 *
 *  - description
 *    - highest priority and quantity in RSS feeds for both meta and item nodes.
 *    - rarely found in ATOM feeds, commonly found in RSS feeds
 *  - subtitle
 *    - highest priority and quantity in ATOM feeds for meta nodes
 *    - rarely found in RSS feeds
 *  - summary
 *    - highest priority in ATOM feeds for item nodes.
 *    - rarely found in RSS feeds if ever, almost always found in ATOM feeds
 *    - Item nodes that contain summary will sometimes include content.
 *  - itunes:summary
 *    - next best priority in RSS feeds after description
 *    - rarely found in ATOM feeds if ever, sometimes found in RSS feeds.
 *  - content:encoded
 *    - least priority for item nodes
 *    - more commonly found in RSS feeds and rarely found in ATOM feeds if ever
 *  - content
 *    - least priority for item nodes
 *    - more commonly found in ATOM feeds and sometimes found in RSS feeds
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseDescription (node, nodeType, feedType) {
  var propOrder = nodeType === 'item' ?
    ['description', 'summary', 'itunes:summary', 'content:encoded', 'content'] :
    ['description', 'subtitle', 'itunes:summary'];

  return utils.stripHtml(utils.getFirstFoundPropValue(node, propOrder));
}
exports.parseDescription = parseDescription;

/**
 * Parses the link of a meta or item node.  If no link is available, fallback on atom:id for meta or guid for item nodes
 *
 *  - link
 *    - highest priority and quantity in RSS and ATOM feeds for both meta and item nodes.
 *  - atom:link
 *    - next highest priority and quantity in RSS feeds for meta nodes.
 *    - rarely found in ATOM feeds or item nodes if ever.
 *  - atom10:link
 *    - next highest priority in RSS feeds for meta nodes.
 *    - rarely found in ATOM feeds or item nodes if ever.
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseLink (node, nodeType, feedType) {
  var linkVal, id;

  var getLink = function (linkNode) {
    var link = null;

    utils.parse(linkNode, function (linkEl) {
      var linkAttr = linkEl['@'];

      if (linkAttr.href) { // Mostly Atom
        if (!linkAttr.type || linkAttr.type === 'text/html') {
          //alternate is what we are looking for so break out of loop if found
          if (linkAttr.rel === 'alternate') {
            link = linkAttr.href;
            return true;
          } else if (linkAttr.rel === 'self' || !link) {
            link = linkAttr.href;
          }
        }
      } else if (!link || feedType === 'rss') { // Mostly RSS
        //if link text is defined break out of loop
        if (link = utils.get(linkEl)) {
          return true;
        }
      }
    }, this, true);

    return link;
  };

  linkVal = getLink(node.link) || (nodeType === 'meta' && (getLink(node['atom:link']) || getLink(node['atom10:link'])));

  if (!linkVal) {
    id = nodeType === 'meta' ? utils.get(node['atom:id']) : utils.get(node.guid);
    if (id && /^https?:/.test(id)) {
      linkVal = id;
    }
  }

  return linkVal;
}
exports.parseLink = parseLink;

/**
 * Parses the xmlUrl of a meta node.
 *
 *  - link
 *    - highest priority and quantity in RSS and ATOM feeds for both meta and item nodes.
 *  - atom:link
 *    - next highest priority and quantity in RSS feeds for meta nodes.
 *    - rarely found in ATOM feeds or item nodes if ever.
 *  - atom10:link
 *    - next highest priority in RSS feeds for meta nodes.
 *    - rarely found in ATOM feeds or item nodes if ever.
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseXmlUrl (node, nodeType, feedType) {
  var getLink = function (linkNode) {
    var link;

    utils.parse(linkNode, function (linkEl) {
      var linkAttr = linkEl['@'];

      if (linkAttr.href && linkAttr.rel === 'self') {
        link = linkAttr.href;
        return;
      }
    }, this, true);

    return link;
  };

  return getLink(node.link) || getLink(node['atom:link']) || getLink(node['atom10:link']);
};
exports.parseXmlUrl = parseXmlUrl;

/**
 * Parses the origLink for item nodes.
 *
 * @param node
 * @param nodeType
 * @param feedType
 */
function parseOrigLink (node, nodeType, feedType) {
  var origLink;

  if (origLink = utils.getFirstFoundPropValue(node, ['feedburner:origlink', 'pheedo:origlink'])) {
    return origLink;
  } else {
    utils.parse(node.link, function (linkEl) {
      var linkAttr = linkEl['@'];

      if (linkAttr.href && linkAttr.rel === 'canonical') {
        origLink = linkAttr.href;
        return true;
      }
    }, this, true);
  }

  return origLink;
}
exports.parseOrigLink = parseOrigLink;

/**
 * Parses the author for meta and item nodes
 *
 *  - author
 *    - highest priority in ATOM and RSS feeds for both meta and item nodes
 *    - more commonly found in ATOM feeds than RSS feeds
 *  - managingeditor
 *    - next highest priority for RSS feeds in meta nodes
 *    - more commonly found in RSS feeds and rarely found in ATOM feeds if ever
 *    - generally more specific than webmaster
 *  - webmaster
 *    - next highest priority for RSS feeds in meta nodes
 *    - more commonly found in RSS feeds and rarely found in ATOM feeds if ever
 *    - generally less specific than managingeditor
 *  - dc:creator
 *    - next highest priority for meta and item nodes in RSS feeds, and item nodes in ATOM feeds
 *    - rarely found in meta nodes for ATOM feeds if ever
 *    - can include an author, email, or entity name
 *  - itunes:author
 *    - next highest priority for meta and item nodes in RSS feeds
 *    - sometimes found in RSS feeds, rarely found in ATOM feeds if ever
 *    - can include an author, email, or entity name
 *  - dc:publisher
 *    - next highest priority for meta and item nodes in RSS feeds
 *    - sometimes found in RSS feeds, rarely found in ATOM feeds if ever
 *    - can include an author, email, or entity name
 *  - itunes:owner
 *    - least priority for meta nodes in RSS feeds
 *    - rarely found in item nodes for RSS feeds, or meta and item nodes for ATOM feeds if ever
 *    - can include an author, email, or entity name
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseAuthor (node, nodeType, feedType) {
  var authorNode = node.author,
      author;

  //Both meta and item have author property as top priority and share parsing logic.
  if (authorNode && (author = utils.get(authorNode))) {
    author = addressparser(author)[0];
    return author.name || author.address;
  }
  else if (authorNode && (author = utils.get(authorNode.name) || utils.get(authorNode.email))) {
    return author;
  }
  // use addressparser to parse managingeditor or webmaster properties for meta nodes
  else if (nodeType === 'meta' && (author = utils.get(node.managingeditor) || utils.get(node.webmaster))) {
    author = addressparser(author)[0];
    return author.name || author.address;
  }
  //parse the next properties in order
  else if (author = utils.getFirstFoundPropValue(node, ['dc:creator', 'itunes:author', 'dc:publisher'])) {
    return author;
  }
  else if (node['itunes:owner'] && (author = utils.get(node['itunes:owner']['itunes:name']) || utils.get(node['itunes:owner']['itunes:email']))) {
    return author;
  }

  return null;
}
exports.parseAuthor = parseAuthor;

/**
 * Parses the language for meta nodes
 *
 *  - language
 *    - highest priority for RSS feeds
 *    - commonly found in RSS feeds and rarely in ATOM feeds if ever
 *  - xml:lang
 *    - highest priority for ATOM feeds
 *    - more commonly found in ATOM feeds and rarely found in RSS feeds if ever
 *  - dc:language
 *    - next highest priority for RSS feeds
 *    - more commonly found in RSS feeds and rarely found in ATOM feeds if ever
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseLanguage (node, nodeType, feedType) {
  return utils.get(node.language) || utils.getAttr(node, 'xml:lang') || utils.get(node['dc:language']);
}
exports.parseLanguage = parseLanguage;

/**
 * Parses the icon for meta nodes
 *
 *  - icon
 *    - only property that gives us a icon/favicon.
 *    - only found in ATOM feeds.
 *    - RSS doesn't offer a property for the icon.  For site logos/images see the image property
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseIcon (node, nodeType, feedType) {
  return utils.get(node.icon);
}
exports.parseIcon = parseIcon;

/**
 * Parses the copyright for meta nodes
 *
 *  - copyright
 *    - highest priority for RSS feeds.
 *    - rarely found in ATOM feeds if ever.
 *  - rights
 *    - highest priority for ATOM feeds.
 *    - rarely found in RSS feeds if ever.
 *  - dc:rights
 *    - next highest priority for both RSS and ATOM feeds.
 *  - media:copyright
 *    - very rare in RSS feeds.
 *    - rarely found in ATOM feeds if ever.
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseCopyright (node, nodeType, feedType) {
  return utils.getFirstFoundPropValue(node, ['copyright', 'rights', 'dc:rights', 'media:copyright']);
}
exports.parseCopyright = parseCopyright;

/**
 * Parses the common meta properties used to determine when to update or get a new feed
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {{}}
 */
function parseUpdateInfo (node, nodeType, feedType) {
  var updateInfo = {}, temp;

  if (temp = utils.get(node['sy:updatefrequency'])) {
    updateInfo.frequency = temp;
  }
  if (temp = utils.get(node['sy:updateperiod'])) {
    updateInfo.period = temp;
  }
  if (temp = utils.get(node['sy:updatebase'])) {
    updateInfo.base = temp;
  }
  if (temp = utils.get(node.ttl)) {
    updateInfo.ttl = temp;
  }

  return Object.keys(updateInfo).length ? updateInfo : null;
}
exports.parseUpdateInfo = parseUpdateInfo;

/**
 * Parses the generator of a meta node.  Since the generator node could have the value in the attributes as well, we
 * have to check all options.  If we can't set a generator from the generator node, then check admin:generatoragent
 *
 *  - generator
 *    - highest priority and most frequent for both RSS and ATOM feeds.
 *  - admin:generatoragent
 *    - less common and used as a fallback for generator.
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseGenerator (node, nodeType, feedType) {
  var genNode = node.generator, genTemp, generator;

  if (genNode) {
    generator = utils.get(genNode) || '';
    if (genTemp = utils.getAttr(genNode, 'version')) {
      generator += ((generator ? ' v' : 'v') + genTemp);
    }
    if (genTemp = utils.getAttr(genNode, 'uri')) {
      generator += (generator ? ' ' + genTemp : genTemp);
    }
  }
  //if the logic above didn't set the generator, check the generatoragent
  if (!generator && (genTemp = utils.getAttr(node['admin:generatoragent']))) {
    generator = genTemp && (genTemp['rdf:resource'] || genTemp.resource);
  }

  return generator;
}
exports.parseGenerator = parseGenerator;

/**
 * Parses the image of a meta or item node.
 *
 *  - image
 *    - highest priority for RSS feeds in both meta nd item nodes
 *    - most frequent in meta nodes, less frequent in item nodes
 *  - itunes:image
 *    - second most frequent in RSS feeds for meta nodes
 *    - less frequent and lesser priority than media:thumbnail in RSS feeds for item nodes
 *  - media:thumbnail
 *    - second highest priority for item nodes for RSS and ATOM feeds
 *    - third most frequent in meta nodes for RSS and ATOM feeds
 *    - for item nodes, the media:thumbnail is searched for in the main node, node['media:content'],
 *      node['media:group'], and node['media:group']['media:content'] respectively
 *  - media:content
 *    - url attr is used as a fallback if media:thumbnail is not available.  Since medi:content can also contain non
 *      images such as videos, extra logic must be performed to guarantee an image
 *  - logo
 *    - very infrequent but sometimes found in ATOM feeds for meta nodes
 *
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseImage (node, nodeType, feedType) {
  var image, mediaGroup, mediaContent;

  if (node.image && (image = utils.get(utils.get(node.image, 'url') || node.image))) {
    return image;
  } else if (nodeType === 'meta') {
    return utils.getAttr(node['itunes:image'], 'href') || utils.getAttr(node['media:thumbnail'], 'url') || utils.get(node.logo);
  }
  else if (nodeType === 'item') {
    mediaGroup = node['media:group'];
    mediaContent = node['media:content'];

    //search for media:thumbnail url in the following order:.  node, node['media:content'], node['media:group'], node['media:group']['media:content']
    if (image = utils.getAttr(node['media:thumbnail'] || utils.get(mediaContent || mediaGroup, 'media:thumbnail') ||
      utils.get(mediaGroup && mediaGroup['media:content'], 'media:thumbnail'), 'url')) {
      return image;
    }
    //search for itunes:image href
    else if (image = utils.getAttr(node['itunes:image'], 'href')) {
      return image;
    }
    //fall back on node['media:content'] or node['media:group']['media:content'] url
    else if (image = utils.getAttr(mediaContent || (mediaGroup && mediaGroup['media:content']))) {
      if (image.url && (image.medium === 'image' || (image.type && image.type.indexOf('image') === 0) || /\.(jpg|jpeg|png|gif)/.test(image.url))) {
        return image.url;
      }
    }
  }
}
exports.parseImage = parseImage;

/**
 * Parses the cloud of a meta node.
 *
 *  - cloud
 *    - highest priority for RSS feeds
 *    - rarely found in ATOM feeds if ever
 *  - link (rel=hub)
 *    - mostly found in ATOM feeds and rarely in RSS
 *
 * @param node
 * @param nodeType
 * @param feedType
 */
function parseCloud (node, nodeType, feedType) {
  var cloud,
      temp = utils.getAttr(node.cloud) || {};

  if (Object.keys(temp).length) {
    cloud = temp;
    cloud.type = 'rsscloud';
  } else {
    utils.parse(node.link, function (link) {
      var attr = utils.getAttr(link);
      if (attr && attr.href && attr.rel === 'hub') {
        cloud = {type: 'hub', href: attr.href};
        return true;
      }
    }, this, true);
  }

  return cloud;
}
exports.parseCloud = parseCloud;

/**
 * Parses and aggregates an Array of categories for an item or meta node.  The following node properties are parsed in
 * order of most frequently available.  Categories for a specific node are uniquely identified and cached by value,
 * then mapped to an array of categories
 *
 * category, dc:subject, link, itunes:category, media:category
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {Array}
 */
function parseCategories (node, nodeType, feedType) {
  var categoryMap = {};

  var setCategory = function (category, attrProp) {
    if (!category) {
      return;
    } else if (attrProp) {
      category = utils.getAttr(category, attrProp);
    }

    if (!categoryMap[category]) {
      categoryMap[category] = true;
    }
  };

  var splitAndSetCategory = function (category, delimiter) {
    category && category.split(delimiter).forEach(function (cat) {
      setCategory(cat);
    });
  };

  ['category', 'dc:subject', 'itunes:category', 'media:category'].forEach(function (key) {
    if (!node[key]) {
      return;
    }

    utils.parse(node[key], function (category) {
      if (key === 'category') {
        setCategory.apply(null, (feedType === 'atom' ? [category, 'term'] : [utils.get(category)]));
      } else if (key === 'dc:subject') {
        splitAndSetCategory(utils.get(category), ' ');
      } else if (key === 'itunes:category') {
        //sometimes itunes:category has it's own itunes:category property
        setCategory(category, 'text');
        utils.parse(category[key] || category, function (cat) {
          setCategory(cat, 'text');
        });
      } else if (key === 'media:category') {
        splitAndSetCategory(utils.get(category), '/');
      }
    });
  });

  var categories = Object.keys(categoryMap);

  return categories.length && categories.map(function (key) {
    return key;
  });
}
exports.parseCategories = parseCategories;

/**
 * Parses comments for item nodes
 *
 *  - comments
 *    - highest priority for RSS and ATOM feeds
 *  - link (rel=replies)
 *    - fallback for comments sometimes found in ATOM feeds
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseComments (node, nodeType, feedType) {
  var comments = utils.get(node.comments);

  if (!comments && feedType === 'atom') {
    utils.parse(node.link, function (link) {
      var linkAttr = link['@'];

      if (linkAttr && linkAttr.rel === 'replies' && linkAttr.href) {
        comments = linkAttr.href;
        //if comments are text/html then break out of loop
        if (linkAttr.type === 'text/html') {
          return true;
        }
      }
    }, this, true);
  }

  return comments;
}
exports.parseComments = parseComments;

/**
 * Parses the feed url for comments
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {*}
 */
function parseCommentRss (node, nodeType, feedType) {
  return utils.get(node['wfw:commentrss']);
}
exports.parseCommentRss = parseCommentRss;

/**
 * Creates an enclosure given a required url and optional type/length.  Although required by the RSS spec, many feeds
 * don't include a type or length so we should just rely on url and use that for the id of the enclosures hash.
 *
 * @param url
 * @param type
 * @param length
 * @returns {{url: *}}
 */
function createEnclosure (url, type, length) {
  if (!url) {
    return null;
  }

  var enclosure = {url: url};
  if (type) {
    enclosure.type = type;
  }
  if (length !== undefined) {
    enclosure.length = length;
  }
  return enclosure;
}

/**
 * Parses and aggregates an Array of enclosures for an item node.  The following node properties are parsed in
 * order of most frequently available.  enclosures for a specific node are uniquely identified and cached by url,
 * then mapped to an array of enclosures
 *
 * media:content, enclosure, link, enc:enclosure
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {Array}
 */
function parseEnclosures (node, nodeType, feedType) {
  var enclosuresMap = {};

  ['media:content', 'enclosure', 'link', 'enc:enclosure'].forEach(function (key) {
    if (!node[key]) {
      return;
    }

    utils.parse(node[key], function (enc) {
      var enclosure,
          encAttr = enc['@'];

      if (!encAttr) {
        return;
      }

      switch(key) {
        case('media:content'):
          enclosure = createEnclosure(encAttr.url, encAttr.type || encAttr.medium, encAttr.filesize);
          break;
        case('enclosure'):
          enclosure = createEnclosure(encAttr.url, encAttr.type, encAttr.length);
          break;
        case('link'):
          if (encAttr.rel === 'enclosure' && encAttr.href) {
            enclosure = createEnclosure(encAttr.href, encAttr.type, encAttr.length);
          }
          break;
        case('enc:enclosure'):
          enclosure = createEnclosure(encAttr.url || encAttr['rdf:resource'], encAttr.type, encAttr.length);
          break;
      }

      if (enclosure) {
        enclosuresMap[enclosure.url] = enclosure;
      }
    });
  });

  var enclosures = Object.keys(enclosuresMap);

  return enclosures.length && enclosures.map(function (key) {
    return enclosuresMap[key];
  });
}
exports.parseEnclosures = parseEnclosures;

/**
 * Parses the guid for item nodes
 *
 *  - guid
 *    - highest priority in RSS feeds
 *    - rarely found in ATOM feeds if ever.
 *  - id
 *    - highest priority in ATOM feeds
 *    - commonly found in ATOM feeds, sometimes found in RSS feeds.
 *
 * @param node
 * @param nodeType
 * @param feedType
 */
function parseGuid (node, nodeType, feedType) {
  return utils.getFirstFoundPropValue(node, ['guid', 'id']);
}
exports.parseGuid = parseGuid;

/**
 * Parse the source of an item node
 *
 * @param node
 * @param nodeType
 * @param feedType
 */
function parseSource (node, nodeType, feedType) {
  var source = {},
      sourceNode = node.source,
      temp;

  if (!sourceNode) {
    return;
  }

  if (temp = (feedType === 'atom' && utils.get(sourceNode.title)) || utils.get(sourceNode)) {
    source.title = temp;
  }
  if (temp = (feedType === 'atom' && utils.getAttr(sourceNode.link, 'href')) || utils.getAttr(sourceNode, 'url')) {
    source.url = temp;
  }

  return Object.keys(source).length && source;
}
exports.parseSource = parseSource;

/**
 * Parses the content of an item node
 *
 *  - content:encoded:
 *    - more frequent than content
 *    - commonly found in RSS feeds and rarely found in ATOM feeds
 *  - content:
 *    - less frequent than content:encoded
 *    - commonly found in ATOM feeds and sometimes found in RSS feeds
 *
 * @param node
 * @param nodeType
 * @param feedType
 * @returns {string}
 */
function parseContent (node, nodeType, feedType) {
  return utils.getFirstFoundPropValue(node, ['content:encoded', 'content']);
}
exports.parseContent = parseContent;

/**
 * Determines whether or not the meta will be pushed to the stream.  Here's where you can inject custom logic.
 * For example, if you require an author for all your meta nodes, you can return false if the meta's author is
 * undefined.
 *
 * @param meta
 * @param feedType
 * @returns {boolean}
 */
function isMetaValid (meta, feedType) {
  return true;
}
exports.isMetaValid = isMetaValid;

/**
 * Determines whether or not an item will be pushed to the stream.  Here's where you can inject custom logic.
 * For example, if you require a date for all your feed items, you can return false if the item's pubDate is
 * invalid or undefined.
 *
 * @param item
 * @param feedType
 * @returns {boolean}
 */
function isItemValid (item, feedType) {
  return true;
}
exports.isItemValid = isItemValid;

/**
 * Determines whether or not the current tag is a channel/feed
 *
 * @param tagName
 * @param prefix
 * @param local
 * @param feedType
 * @returns {boolean}
 */
function isChannelTag (tagName, prefix, local, feedType) {
  return tagName === 'channel' || tagName === 'feed'
    || (local === 'channel' && (prefix === '' || feedType === 'rdf'))
    || (local === 'feed' && (prefix === '' || feedType === 'atom'))
}
exports.isChannelTag = isChannelTag;

/**
 * Determines whether or not the current tag is an item/entry
 *
 * @param tagName
 * @param prefix
 * @param local
 * @param feedType
 * @returns {boolean}
 */
function isItemTag (tagName, prefix, local, feedType) {
  return tagName === 'item' || tagName === 'entry'
    || (local === 'item' && (prefix === '' || feedType === 'rdf'))
    || (local === 'entry' && (prefix === '' || feedType === 'atom'));
}
exports.isItemTag = isItemTag;