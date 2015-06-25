[![Build Status](https://secure.travis-ci.org/djett41/node-feedjett.png?branch=master)](https://travis-ci.org/djett41/node-feedjett)

[![NPM](https://nodei.co/npm/feedjett.png?downloads=true&stars=true)](https://www.npmjs.com/package/feedjett)
#  FeedJett - A Fast Robust RSS, Atom, and RDF feed parser in Node.js - Like a Jett ;-)

This module is inspired by Dan Mactough's [node-feedparser](https://github.com/danmactough/node-feedparser) module
which parses RSS, Atom, and RDF feeds using Isaac Schlueter's sax parser.

FeedJett is built on much of the same model for sax parsing as feedparser and shares alot of the same boiler plate code
to parse feeds, though it does contain many enhancements and features as listed below

### Enhancements / Features of FeedJett

- Built on a fully customizable framework for parsing any and every node for all feeds.
- Allows passing in custom parsers to parse nodes of a feed that may not be available in FeedJett out of the box
- Let's you control what is parsed and how a feed is parsed so that unnecessary CPU bound tasks aren't performed
- Allows you to whitelist or blacklist specific normalized properties to be parsed
- Parsing functions are isolated increasing testability; all parsing logic is unit tested
- Additional properties and enhanced parsing for some properties
- Code refactored for readability, speed, and dynamic code reuse


## Installation

```bash
npm install feedjett
```

## Usage

The easiest way to use feedjett is to just give it a [readable stream](http://nodejs.org/api/stream.html#stream_readable_stream).
It will then return a readable object stream.

```js

var FeedJett = require('feedjett'),
    request = require('request');

var req = request('http://somefeedurl.xml'),
    feedjett = new FeedJett([options]);

req.on('error', function (error) {
  // handle any request errors
});
req.on('response', function (res) {
  var stream = this;

  if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

  stream.pipe(feedjett);
});


feedjett.on('error', function(error) {
  // always handle errors
}).on('meta', function (meta) {
  // emits the meta event if parseMeta is true (defaults to true)
  console.log(meta);
}).on('readable', function() {
  // This is where the action is!
  var stream = this, item;

  while (item = stream.read()) {
  //item will also have a meta object attached to it if addMeta is true (defaults to true)
    console.log(item);
  }
});

```

I *strongly* encourage you to take a look at the [demo test case](demo/demo.js)
for a more thorough working example.

### How FeedJett works

FeedJett parses exactly what you want and how you want.  By default FeedJett defines Arrays of properties for meta
that dictate what the result meta or item should look like for all feeds (assuming normalize is set to true).
These Arrays of properties are defined in an object called normalizedProps (one for meta, one for item).  Each property
in the Array will map to a parsing function which is responsible for parsing and normalizing node values into the
defined property.  This way, we aren't looping through each and ever property in the node, but instead are just
parsing what needs to be parsed and nothing more.  Default normalized props and parsing functions can be tailored
and customized as described in the next section.

## Options

When creating a new instance of FeedJett, you can pass in an options object with one or more of the following
object properties

NOTE: some of the following options may be similar to FeedParser but syntactically different (camelCased in most cases)

- `normalize` - (Default: `true`) - Set to `false` to override FeedJett's default behavior, which is to parse feeds
  into an object that contains the generic properties patterned after (although not identical to) the RSS 2.0 format,
  regardless of the feed's format.  These properties are defined in the next section.

- `addMeta` -  (Default: `true`) - Set to `false` to override FeedJett's default behavior, which is to add the
  feed's `meta` information to each item.

- `feedUrl` - (Default: `undefined`) - The url (string) of the feed. FeedJett will use this value to set the xmlBase or
  and resolve relative URL's if `xml:base` isn't defined.  Unlike FeedParser, FeedJett resolves relative URL's only if
  xml:base is defined, it does not try to determine the base url from other tags.

- `resumeOnSaxError` - (Default: `true`) - Set to `false` to override FeedJett's default behavior, which is to emit
  any `SAXError` on `error` and then automatically resume parsing. As noted by FeedParser, `SAXErrors` are not usually
  fatal, so this is usually helpful behavior. If you want total control over handling these errors and optionally
  aborting parsing the feed, use this option.

- `strict` - (Default: `false`) set to `true` for strict mode (npm sax option)

- `MAX_BUFFER_LENGTH` - (Default: 16K `(16 * 1024 * 1024)` - Default buffer length (npm sax option)

- `parseMeta` - (Default: `true`) - set to `false` to skip parsing AND emitting the `meta` object.  This can speed up
  processing if you know you don't need or want `meta` information.

- `parseRawNode` - (Default: `false`) - set to `true` if you would like the raw properties (non-normalized) for a
  `meta` or `item` node to be added to the `raw` property (meta.raw or item.raw).  If set to true, each property
  will retain it's original prefix.  If a property does not include a prefix, then the feed type will be the prefix
  for the raw property.  (Default behavior in FeedParser)

### options continued.. (customizations)

Add the following to the options object to further customize the parsing framework for FeedJett.  These options and
customizations assume that the `normalize` option is not set to `false`.

### Normalized Properties Customizations

- `blackList` - {Array} - Define an array of String properties in order to disable parsing for specific normalized
  properties.  For example if you want all normalized properties to be parsed for a meta or item node except for
  description and updatedDate, then you would set these in the blackList array.  This would let FeedJett know to NOT
  call the parseDescription or parseUpdatedDate parser functions, thus excluding both properties from the result meta
  or item object.  These values apply to both `meta` and `item`.

- `whiteList` - {Array} - Define an array of String properties in order to restrict parsing for ONLY the specified
  normalized properties.  For example if you only want the result object to contain a title, description, link, and
  pubDate, you would set these in the whiteList array.  This would let FeedJett know to call ONLY the parser functions
  associated with these normalized properties and nothing else.  These values apply to both `meta` and `item`.
  Whitelisting only the properties you require can speed up processing.

NOTE: You can only define either `blackList` OR `whiteList` on options.  If both are defined, `whiteList` will take
precedence

```js


var options = {
  blackList = ['description', 'updatedDate']
};

//OR!! Don't define both!!!

var options = {
  whiteList = ['title', 'description', 'link', 'pubDate']
};
var feedjett = new FeedJett(options);  //... other feedjett logic as shown in earlier section

```

### Parsing Function Customizations

The following object (defined in feedjett.js) maps normalized props to parsing functions defined in the `parser.js`
file.  You will also find detailed parsing information and logic for each parsing function.

```js

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

```

If the parsing logic for a specific parsing function doesn't suit your needs, then you can easily override the function
with your own.  For example, if you would like to parse the normalized description property, you can add the following
function to the `options` object, (must match the parsing function name) which will then be used to parse and
normalize the description property.

NOTE: each parsing function can define the following parameters be passed in the following node
  - `node`     : {Object} The raw item or meta used to check for other properties in order to normalize description
  - `nodeType` : {String} The type of node (`meta` or `item`)
  - `feedType` : {String} The type of feed (`rss`, `atom`, or `rdf`)

```js

var options = {
  parseDescription: function (node, nodeType, feedType) {
    //add your custom parsing logic here

    return 'custom parsed string value!';
  }
};
var feedjett = new FeedJett(options);  //... other feedjett logic as shown in earlier section

```

### Custom Properties and Parsers via `FeedJett.addCustomParser`

FeedParser provides a static function for adding custom properties not avialable by FeedJett as well as providing a
custom parser function to normalize the property.  To achieve this you can call the `FeedJett.addCustomParser`, passing
in the custom property name, nodeType for the custom property, parser function name, and parser function.

For example, if you wanted to add a custom normalized property to both meta and item objects called `myProperty`, you
would write the following code.

```js

FeedJett.addCustomParser('myProperty', ['item', 'meta'], 'parseMyProperty', function (node, nodeType, feedType) {

  //custom logic for parsing and normalizing myProperty.  For example if you wanted the text value of atom:id to be
  //the value of myProperty, you would do the following.. ('#' are for text values, @ for attribute objects)
  return node['atom:id'] && node['atom:id']['#'];
});

var feedjett = new FeedJett();  //... other feedjett logic as shown in earlier section

```

Now when you listen to readable for items or the meta event for meta, the result object will include `myProperty` which
would have a value that equals the return value of `parseMyProperty`.  Behind the scenes, addCustomParser will add the
property to the normalizedProps meta or item Arrays, then add the `myProperty -> parseMyProperty` mapping to the
`propertyParserMap` object, then dynamically invoke the custom function and set the property on the result object.

### Custom Parsing Hooks

You can also include functions that can hook into the parsing framework.  The following functions can be defined on
the `options` object to achieve this

- `afterParseItem` - {Function} - If passed in through options, this function will be invoked AFTER all property
  parsing functions have been invoked for an `item` and the `item` is normalized, and after the `meta` object is
  attached to the `item`.  (Assuming both `parseMeta` and `addMeta` are both true.

- `afterParseMeta` - {Function} - If passed in through options, this function will be invoked AFTER all property
  parsing functions have been invoked for a `meta` and the `meta` is normalized. (Assuming `parseMeta` is true).
  This will be invoked BEFORE the `meta` event has been emitted.

The following example illustrates how you can hook into the parsing framework AFTER an item or meta is parsed and
define any additional logic.  The raw node (`item` or `meta`) and `feedType` (rss, atom or rdf) will be available
as parameters.  No return value is needed as you can add properties on the meta or item object.

```js

var options = {
  afterParseItem: function (item, nodeType, feedType) {
    //custom logic.. set link to guid if the parsing functions couldn't normalize link
    if (!item.link) {
      item.link = item.guid;
    }
  },
  afterParseMeta: function (meta, nodeType, feedType) {
    //custom logic.. set updatedDate to pubDate if the parsing functions couldn't normalize updatedDate
    if (!meta.updatedDate) {
      meta.updatedDate = meta.pubDate;
    }
  }
};
var feedjett = new FeedJett(options);  //... other feedjett logic as shown in earlier section

```

- `isMetaValid` - {Function} - If passed in through options, this function will be invoked AFTER all parsing is
  complete for meta (including `afterParseMeta`).  This is the function that determines whether or not a meta object
  is valid and can be emitted from FeedJett.  The default `isMetaValid` function just returns true, but you can
  provide your own implementation to override the default behavior.

- `isItemValid` - {Function} - If passed in through options, this function will be invoked AFTER all parsing is
  complete for an item (including `afterParseItem`).  This is the function that determines whether or not an item
  object is valid and can be pushed (and emitted in readable) from FeedJett.  The default `isItemValid` function
  returns true, but you can provide your own implementation to override the default behavior.

The following example illustrates how you can override the default behavior to determine whether or not an item or
meta is valid. The raw node (`item` or `meta`) and `feedType` (rss, atom or rdf) will be available as parameters.
A boolean value `true` or `false` must be returned

```js

var options = {
  isMetaValid: function (meta, nodeType, feedType) {
    //custom logic.. mark meta valid and emit meta only if feedType is rss..
    return feedType === 'rss';
  },
  isItemValid: function (item, nodeType, feedType) {
    //custom logic.. mark an item as valid only if it contains a pubDate
    return !!item.pubDate;
  }
};
var feedjett = new FeedJett(options);  //... other feedjett logic as shown in earlier section

```

## Examples

See the [`demo`](test/demo/) directory.

## API

### Transform Stream

Like FeedParser, FeedJett is a [transform stream](http://nodejs.org/api/stream.html#stream_class_stream_transform)
operating in "object mode": XML in -> Javascript objects out.  Each readable chunk is an object representing an
item (article) in the feed.

### Events Emitted

* `meta`      - called with feed `meta` when it has been parsed
* `readable`  - called when an item has been parsed
* `end`       - called when a feed has finished parsing
* `error`     - called with `error` whenever there is a FeedJett error of any kind (SAXError, FeedJett error, etc.)

## FeedJett Normalized properties

FeedJett parses each feed into a `meta` (emitted on the `meta` event) portion and one or more `item`
(emitted on the `data` event or readable after the `readable` is emitted).

Regardless of the format of the feed, the `meta` and each `item` contain a uniform set of generic properties
patterned after (although not identical to) the RSS 2.0 format, and optionally all of the properties originally
contained in the feed. So, for example, an Atom feed may have a `meta.description` property, but it could also have
a `meta['atom:subtitle']` property.

The purpose of the generic properties is to provide the user a uniform interface for accessing a feed's information
without needing to know the feed's format (i.e., RSS versus Atom) or having to worry about handling the differences
between the formats. However, the original information is configurable in case you need it. In addition, FeedJett
supports some popular namespace extensions (or portions of them), such as portions of the `itunes`, `media`,
`feedburner` and `pheedo` extensions. So, for example, if a feed article contains either an `itunes:image` or
`media:thumbnail`, the url for that image will be contained in the article's `image` property.

Unlike FeedParser, FeedJett does NOT pre-initialize generic properties and keeps result objects as thin as possible.
Additionally, result object properties are camelCased.  In contrast, the original raw node will contain lowercase
property names (which is how sax parses the nodes).  So for example if you are defining a custom function to parse
the pubDate normalized prop, you look for node.pubdate in the Raw node, but the normalized object will have the
property item.pubDate.

The `title` and `description` properties of `meta` and the `title` property of each `item` have any HTML stripped
if you let FeedJett normalize the output.  If you really need the HTML in those elements, there are always
the originals by passing in parseRawNode: true in options and accessing the original property in the meta.raw object.
e.g., `meta['atom:subtitle']['#']`.


### List of normalized meta properties (similar to RSS channel, or ATOM feed)
* title       - {String}  with HTML stripped
* description - {String}  with HTML stripped
* link        - {String}  website link
* pubDate     - {Date}    original published date
* updatedDate - {Date}    most recently updated date
* categories  - {Array}   An Array of Strings
* author      - {String}
* image       - {String}
* xmlUrl      - {String}  The canonical link to the feed, as specified by the feed
* language    - {String}
* icon        - {String}
* copyright   - {String}
* generator   - {String}
* updateInfo  - {Object}  Includes information on when to update feed content (frequency, period, base, ttl)
* cloud       - {Object}  Always includes type, can also include other dynamic cloud properties

NOTE:
  1. meta object's will also always include the following properties

* #ns         - {Array}   An array of namespace Strings for the feed
* @'          - {Object}  Contains any attributes of the top level tag (feed, rss, etc)
* #xml        - {Object}  The parsed xml tag and/or attributes
* #type       - {String}  The type of feed (rss, atom, or rdf)


  2. If options' parseRawNode is true, meta will include a `raw` property that contains all raw nodes from the feed
  3. FeedJett icon, and updatedDate are same as FeedParser favicon, and date.  FeedJett adds updateInfo
  3. FeedJett image values are just the url, rather than other information which is often unavailable.

### List of normalized item properties (similar to RSS item, or ATOM entry)
* title       - {String}  with any HTML stripped
* description - {String}  with any HTML stripped
* link        - {String}  article link
* pubDate     - {Date}    original published date
* updatedDate - {Date}    most recently updated date
* categories  - {Array}   An Array of Strings
* author      - {String}
* image       - {String}
* content     - {String}  frequently, the full article content
* guid        - {String}  A unique identifier for the article
* origLink    - {String}  Tracking url for FeedBurner or Pheedo. `origLink` contains the original link
* comments    - {String}  A link to the article's comments section
* commentRss  - {String}  A link to the article's comments feed
s enclosures  - {Array}   Array of Objects with `url`, `type`, and/or `length` representing a podcast or enclosure.
* source      - {Object}  Contains `url`, `title`; The original source for an article; see the [RSS Spec](http://cyber.law.harvard.edu/rss/rss.html#ltsourcegtSubelementOfLtitemgt) for an explanation of this element)

NOTE:
  1.  If parseMeta and addMeta are both true, item will include a `meta` property that includes meta properties.
  2.  If parseRawNode is true, meta will include a `raw` property that contains all raw nodes from the feed
  3.  FeedJett content, and updatedDate are the same as FeedParser summary, and date.  (Although I believe more
      accurate ;-)).  FeedJett adds commentRss, but drops support for permalink.


## Issues

- Issues? Feature Requests? reported an [issue](https://github.com/djett41/node-feedjett/issues).

## License

(The MIT License)

Copyright (c) 2015 Devin Jett and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
