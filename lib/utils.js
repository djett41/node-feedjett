
/**
 * Module dependencies.
 */
var URL = require('url')
  , NS = require('./namespaces')
  ;

var timezoneMap = {
  'BST': 'GMT+0100'
};

/**
 * Safe hasOwnProperty
 * See: http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/
 */
function has (obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
exports.has = has;


/**
 * Utility function to test for and extract a subkey.
 *
 * var obj = { '#': 'foo', 'bar': 'baz' };
 *
 * get(obj);
 * // => 'foo'
 *
 * get(obj, 'bar');
 * // => 'baz'
 *
 * @param {Object} obj
 * @param {String} [subkey="#"] By default, use the '#' key, but you may pass any key you like
 * @return {*} Returns the value of the selected key or 'null' if undefined.
 */
function get(obj, subkey) {
  if (!obj) { return; }

  if (Array.isArray(obj)) {
    obj = obj[0];
  }
  return obj[subkey || '#'];
}
exports.get = get;


/**
 * Fetches a specific attribute or the whole attribute for an object
 *
 * @param obj
 * @param attr
 * @returns {*}
 */
function getAttr(obj, attr) {
  if (!obj) { return; }

  if (Array.isArray(obj)) {
    obj = obj[0];
  }

  return (attr && obj['@']) ? obj['@'][attr] : obj['@'];
}
exports.getAttr = getAttr;


/**
 * Expose require('url').resolve
 */
function resolve (baseUrl, pathUrl) {
  return URL.resolve(baseUrl, pathUrl);
}
exports.resolve = resolve;


/**
 * Check whether a given namespace URI matches the given default
 *
 * @param {String} URI
 * @param {String} default, e.g., 'atom'
 * @return {Boolean}
 */
function nslookup (uri, def) {
  return NS[uri] === def;
}
exports.nslookup = nslookup;


/**
 * Return the "default" namespace prefix for a given namespace URI
 *
 * @param {String} URI
 * @return {String}
 */
function nsprefix (uri) {
  return NS[uri];
}
exports.nsprefix = nsprefix;


/**
 * Aggressively strip HTML tags
 * Pulled out of node-resanitize because it was all that was being used
 * and it's way lighter...
 *
 * @param str
 * @returns {*|XML|string|void}
 */
function stripHtml (str) {
  return str && str.replace(/<.*?>/g, '');
}
exports.stripHtml = stripHtml;


/**
 * Invokes a callback with a specified context.
 * If the el is an array, the callback will be called for each item in the array
 *
 * @param el
 * @param parseFn
 * @param context
 */
function parse (el, parseFn, context, canBreak) {
  if (!el) { return; }

  if (!Array.isArray(el)) {
    parseFn.call(context, el);
  } else if (canBreak) {
    el.some(parseFn, context);
  } else {
    el.forEach(parseFn, context);
  }
}
exports.parse = parse;


/**
 * Converts a String array to object.  Used for whitelisting and blacklisting feed properties
 *
 * @param array
 * @returns {*}
 */
function strArrayToObj (array) {
  return array && array.reduce(function(o, v) {
      o[v] = true;
      return o;
    }, {});
}
exports.strArrayToObj = strArrayToObj;


/**
 * Gets the first text property ('#') of a specified node in order of the supplied properties array
 *
 * @param node
 * @param props
 * @returns {*}
 */
function getFirstFoundPropValue (node, props) {
  var i, val;

  if (props) {
    for (i = 0; i < props.length; i++) {
      if (val = get(node[props[i]])) {
        return val;
      }
    }
  }
}
exports.getFirstFoundPropValue = getFirstFoundPropValue;


/**
 * Deletes an array of properties from an object
 *
 * @param obj
 * @param props
 */
function removeProps (obj, props) {
  props && props.forEach(function (prop) {
    delete obj[prop];
  });
}
exports.removeProps = removeProps;

/**
 * Creates an opening XML tag based on tagName and attributes
 *
 * @param tagName
 * @param attrs
 * @returns {string}
 */
function createOpenTag (tagName, attrs) {
  var attrString = Object.keys(attrs).map(function (key) {
    return ' ' + key + '="' + attrs[key] + '"';
  }).join('');

  return '<' + tagName + attrString + '>';
}
exports.createOpenTag = createOpenTag;

/**
 * Creates a closing XML tag based on tagName
 *
 * @param tagName
 * @returns {string}
 */
function createCloseTag (tagName) {
  return '</' + tagName + '>';
}
exports.createCloseTag = createCloseTag;


/**
 * Returns the standard time timezone offset regardless of whether the current time is on standard or daylight saving time.
 *
 * @param node
 * @param nodeType
 * @param feedType
 */
function getStandardTimeOffset(date) {
  var jan = new Date(date.getFullYear(), 0, 1);
  var jul = new Date(date.getFullYear(), 6, 1);
  return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
}
exports.getStandardTimeOffset = getStandardTimeOffset;

/**
 * Determines whether or not the current date is daylight or standard time
 *
 * @returns {boolean}
 */
function isDaylightSavingsTime() {
  var date = new Date();
  return date.getTimezoneOffset() < getStandardTimeOffset(date);
}
exports.isDaylightSavingsTime = isDaylightSavingsTime;

/**
 * Attempts to fix invalid dates coming in from different feeds
 *
 * @param dateString
 * @returns {Date}
 */
function fixInvalidDate(dateString) {
  if (!dateString) {
    return;
  }

  //Convert invalid dates' timezones to GMT using timezoneMap
  dateString = dateString.replace(/BST?/i, function (match) {
    return timezoneMap[match];
  });

  //Some dates come in as ET, CT etc.. and some don't have the correct offset.
  //Matches /ET/EDT/EST/CT/CDT/CST/MT/MDT/MST/PT/PDT/PST if found at the end of a date string
  var newDateString = dateString.replace(/(E|C|M|P)[DS+]?T$/i, function (match) {
    var firstChar = match.charAt(0);
    return isDaylightSavingsTime() ? (firstChar + 'DT') : (firstChar + 'ST');
  });

  return new Date(newDateString);
}
exports.fixInvalidDate = fixInvalidDate;

/**
 * Parses a date string to a date
 *
 * @param dateString
 */
function getDate (dateString) {
  var date = new Date(dateString);

  if (Object.prototype.toString.call(date) === '[object Date]' && !isNaN(date.getTime())) {
    return date;
  }

  //try to fix invalid date
  date = fixInvalidDate(dateString);

  //if date still isn't valid there's not more we can do..
  if (!isNaN(date.getTime())) {
    return date;
  }
}
exports.getDate = getDate;
