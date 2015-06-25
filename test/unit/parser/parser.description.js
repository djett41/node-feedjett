describe('Parser | Description |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml',
        rssDir + 'rss.2.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse the description tag as 1st priority', function () {
      expect(results[0].description).to.equal('Description for meta tag');
    });

    it('should parse the subtitle tag as 2nd priority', function () {
      expect(results[1].description).to.equal('Test Atom subtitle');
    });

    it('should parse the itunes:summary tag as last priority', function () {
      expect(results[2].description).to.equal('Itunes summary text!!');
    });
  });

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        atomDir + 'atom.2.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse description tag as top priority and with CDATA and strip HTML', function () {
      assert.equal(results[0][0].description, 'Test Description in CDATA.');
    });

    it('should parse summary tag as second priority', function () {
      assert.equal(results[1][0].description, 'Test summary for ATOM');
    });

    it('should parse itunes:summary tag as third priority', function () {
      assert.equal(results[2][0].description, 'Test summary for itunes');
    });

    it('should parse content:encoded tag as next priority', function () {
      assert.equal(results[3][0].description, 'Test encoded content for item');
    });

    it('should parse content tag as last priority', function () {
      assert.equal(results[4][0].description, 'Test content for ATOM');
    });
  });

});