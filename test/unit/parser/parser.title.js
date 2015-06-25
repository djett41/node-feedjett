describe('Parser | Title |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse title element for RSS', function () {
      assert.equal(results[0].title, 'Get Some Football Test News');
    });

    it('should parse title element for ATOM', function () {
      assert.equal(results[1].title, 'Test Atom title');
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
        rssDir + 'rss.5.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse title element with CDATA', function () {
      assert.equal(results[0][0].title, 'Manziel apologizes, vows to regain Browns\' trust');
    });

    it('should parse title element with plain text and type attr', function () {
      assert.equal(results[1][0].title, 'Will this midfielder be the next Premier League player to move to MLS?');
    });

    it('should parse title element with plain text', function () {
      assert.equal(results[2][0].title, 'Veteran leadership key to young Lightning\'s success');
    });

    it('should parse first title element when there are multiples', function () {
      assert.equal(results[3][0].title, 'Past success doesn\'t diminish Stanley Cup finals\' excitement for Blackhawks');
    });

    it('should parse html special chars in title', function () {
      assert.equal(results[4][0].title, 'Test & title');
    });
  });
});