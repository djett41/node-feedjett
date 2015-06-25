describe('Parser | Image |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml',
        atomDir + 'atom.1.xml',
        atomDir + 'atom.2.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse image url as top priority', function () {
      expect(results[0].image).to.equal('https://testimageurl/rss.jpg');
    });

    it('should parse image tag contents as next priority', function () {
      expect(results[1].image).to.equal('https://testimage/rss.jpg');
    });

    it('should parse itunes:image href as next priority', function () {
      expect(results[2].image).to.equal('https://testitunesimage/rss.jpg');
    });

    it('should parse media:thumbnail url as next priority', function () {
      expect(results[3].image).to.equal('https://testmediathumbnail/rss.jpg');
    });

    it('should parse logo as next priority', function () {
      expect(results[3].image).to.equal('https://testmediathumbnail/rss.jpg');
    });

    it('should parse logo as next priority', function () {
      expect(results[4].image).to.equal('https://testlogo/rss.jpg');
    });

    it('should parse logo and apply xml base url', function () {
      expect(results[5].image).to.equal('http://testbase.com/logo/rss.jpg');
    });
  });

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml',
        rssDir + 'rss.5.xml',
        rssDir + 'rss.6.xml',
        rssDir + 'rss.7.xml',
        rssDir + 'rss.8.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse image url as top priority', function () {
      expect(results[0][0].image).to.equal('https://testimageurl/rss.jpg');
    });

    it('should parse image tag contents as next priority', function () {
      expect(results[1][0].image).to.equal('https://testimage/rss.jpg');
    });

    it('should parse media:thumbnail url as next priority', function () {
      expect(results[2][0].image).to.equal('http://mediathumbnail.com/test.jpg');
    });

    it('should parse media:content media:thumbnail url as next priority', function () {
      expect(results[3][0].image).to.equal('http://mediacontentthumbnail.com/test.jpg');
    });

    it('should parse media:group media:thumbnail url as next priority', function () {
      expect(results[4][0].image).to.equal('http://mediagroupthumbnail.com/test.jpg');
    });

    it('should parse itunes:image href as next priority', function () {
      expect(results[5][0].image).to.equal('http://itunesimage.com/test.jpg');
    });

    it('should parse media:content url as next priority', function () {
      expect(results[6][0].image).to.equal('http://testmediacontenturl/test.jpg');
    });

    it('should parse media:group media:content url as next priority', function () {
      expect(results[7][0].image).to.equal('http://testmediagroupcontenturl/test.jpg');
    });
  });

});