describe('FeedJett | Item |', function() {
  var rootdir = __dirname + '/../../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');
  var rssDir = rootdir + 'test/feeds/rss/';


  describe('parseMeta:true, addMeta: true, normalized:true, parseRawNode:true |', function() {
    var item;

    before(function(done) {
      var items = [];
      var feedJett = FeedJett.createInstance({parseRawNode: true})
        .on('readable', function () {
          items.push(this.read());
        }).on('end', function () {
          item = items[0];
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should contain normalized nodes when normalized is true', function () {
      var keys = Object.keys(item).map(function (key) {
        return key;
      });

      expect(keys).to.deep.equal([
        'title',
        'description',
        'link',
        'pubDate',
        'updatedDate',
        'categories',
        'author',
        'image',
        'content',
        'guid',
        'origLink',
        'comments',
        'commentRss',
        'enclosures',
        'source',
        'raw',
        'meta'
      ]);
    });

    it('should contain raw data when parseRawNode is true', function () {
      expect(item.raw).to.exist;
    });

    it('should attach meta when parseMeta is true and addMeta is true', function () {
      expect(item.meta).to.exist;
    });

    it('should be pushed when isItemValid returns true', function () {
      expect(item).to.exist;
    });
  });

  describe('parseMeta:true, addMeta: false, normalize:false |', function() {
    var item, meta;

    before(function(done) {
      var items = [];

      var afterParseItem = function (item, feedType) {
        item.testProp = feedType;
      };

      var feedJett = FeedJett.createInstance({addMeta:false, normalize: false, afterParseItem:afterParseItem})
        .on('meta', function (result) {
          meta = result;
        }).on('readable', function () {
          items.push(this.read());
        }).on('end', function () {
          item = items[0];
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should not contain normalized nodes when normalized is false', function () {
      expect(Object.keys(item)).to.deep.equal(['testProp'])
    });

    it('should not contain raw data when parseRawNode is false', function () {
      expect(item.raw).to.not.exist;
    });

    it('meta should still be parsed even when addMeta is false', function () {
      expect(meta).to.exist;
    });

    it('should not attach meta when parseMeta is true and addMeta is false', function () {
      expect(item.meta).to.not.exist;
    });

    it('should call afterParseItem after meta is parsed if defined in options', function () {
      expect(item.testProp).to.equal('rss');
    });
  });

  describe('parseMeta:false, addMeta: true |', function() {
    var item;

    before(function(done) {
      var items = [];

      var feedJett = FeedJett.createInstance({parseMeta:false})
        .on('readable', function () {
          items.push(this.read());
        }).on('end', function () {
          item = items[0];
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should not attach meta when parseMeta is false and addMeta is true', function () {
      expect(item.meta).to.not.exist;
    });

  });

  describe('isItemValid eq false |', function() {
    var item;

    before(function(done) {
      var items = [];

      var isItemValid = function () {
        return false;
      };

      var feedJett = FeedJett.createInstance({isItemValid:isItemValid})
        .on('readable', function () {
          items.push(this.read());
        }).on('end', function () {
          item = items[0];
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should be not pushed when isItemValid returns false', function () {
      expect(item).to.not.exist;
    });

  });

  describe('itemLimit eq 2 |', function() {
    var items = [];

    before(function(done) {
      var feedJett = FeedJett.createInstance({itemLimit:2})
        .on('readable', function () { items.push(this.read()); })
        .on('end', done);

      fs.createReadStream(rssDir + 'rss.espn.xml').pipe(feedJett);
    });

    it('should limit the number of items', function () {
      expect(items).to.have.length(2);
    });

  });
});
