describe('FeedJett | Meta |', function() {
  var rootdir = __dirname + '/../../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');
  var rssDir = rootdir + 'test/feeds/rss/';

  describe('parseMeta:true, normalized:true, parseRawNode:true |', function() {
    var meta = null, count = 0;

    before(function(done) {
      var feedJett = new FeedJett({parseRawNode: true})
        .on('meta', function (result) {
          count++;
          meta = result;
        }).on('readable', function () {
          this.read();
        }).on('end', function () {
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should be parsed when parseMeta is set to true', function () {
      expect(meta).to.exist;
    });

    it('should be emitted when isMetaValid returns true', function () {
      expect(meta).to.exist;
    });

    it('should not be emitted more than once', function () {
      expect(count).to.be.equal(1);
    });

    it('should contain normalized nodes when normalized is true', function () {
      var keys = Object.keys(meta).map(function (key) {
        return key;
      });

      expect(keys).to.deep.equal([
        '#ns',
        '@',
        '#xml',
        '#type',
        '#version',
        'title',
        'description',
        'link',
        'pubDate',
        'updatedDate',
        'categories',
        'author',
        'image',
        'xmlUrl',
        'language',
        'copyright',
        'generator',
        'updateInfo',
        'cloud',
        'raw'
      ]);
    });

    it('should contain raw data when parseRawNode is true', function () {
      expect(meta.raw).to.exist;
    });
  });


  describe('parseMeta:false |', function() {
    var meta = null;

    before(function(done) {
      var feedJett = new FeedJett({parseMeta: false})
        .on('meta', function (result) {
          meta = result;
        }).on('readable', function () {
          this.read();
        }).on('end', function () {
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should not be parsed when parseMeta is set to false', function () {
      expect(meta).to.not.exist;
    });

  });

  describe('parseMeta:true, normalize:false |', function() {
    var meta = null;

    before(function (done) {
      var afterParseMeta = function (meta, feedType) {
        meta.testProp = feedType;
      };

      var feedJett = new FeedJett({normalize:false, afterParseMeta:afterParseMeta})
        .on('meta', function (result) {
          meta = result;
        }).on('readable', function () {
          this.read();
        }).on('end', function () {
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should not contain normalized nodes when normalized is false', function () {
      var keys = Object.keys(meta).map(function (key) {
        return key;
      });

      expect(keys).to.deep.equal([
        '#ns',
        '@',
        '#xml',
        '#type',
        '#version',
        'testProp'
      ]);
    });

    it('should not contain raw data when parseRawNode is false', function () {
      expect(meta.raw).to.not.exist;
    });

    it('should call afterParseMeta after meta is parsed if defined in options', function () {
      expect(meta.testProp).to.equal('rss');
    });
  });

  describe('isMetaValid eq false', function() {
    var meta = null;

    before(function (done) {
      var isMetaValid = function () {
        return false;
      };

      var feedJett = new FeedJett({isMetaValid: isMetaValid})
        .on('meta', function (result) {
          meta = result;
        }).on('readable', function () {
          this.read()
        }).on('end', function () {
          done();
        });

      fs.createReadStream(rssDir + 'rss.1.xml').pipe(feedJett);
    });

    it('should be not emitted when isMetaValid returns false', function () {
      expect(meta).to.not.exist;
    });
  });

});