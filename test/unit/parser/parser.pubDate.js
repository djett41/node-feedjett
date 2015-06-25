describe('Parser | Pub Date |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {

    describe('RSS |', function() {
      var results = [];

      before(function(done) {
        var feeds = [
          rssDir + 'rss.1.xml',
          rssDir + 'rss.2.xml',
          rssDir + 'rss.3.xml'
        ];

        helper.getFeedResults('meta', feeds, function (data) {
          results = data;
          done();
        });
      });

      it('should parse pubDate for RSS feeds as top priority', function () {
        assert.equal(results[0].pubDate.getTime(), new Date('Mon, 22 Jun 2015 13:49:00 PST').getTime());
      });

      it('should parse dc:date for RSS feeds as next priority', function () {
        assert.equal(results[1].pubDate.getTime(), new Date('2015-06-23T07:37:20Z').getTime());
      });

      it('should parse publishedDate for RSS feeds as last priority', function () {
        assert.equal(results[2].pubDate.getTime(), new Date('2015-01-11T01:50:00Z').getTime());
      });
    });

    describe('ATOM |', function() {
      var results = [];

      before(function(done) {
        var feeds = [
          atomDir + 'atom.1.xml',
          atomDir + 'atom.2.xml'
        ];

        helper.getFeedResults('meta', feeds, function (data) {
          results = data;
          done();
        });
      });

      it('should parse published for ATOM feeds as top priority', function () {
        assert.equal(results[0].pubDate.getTime(), new Date('Mon, 22 Jun 2015 13:49:00 PST').getTime());
      });

      it('should parse dc:date for ATOM feeds as next priority', function () {
        assert.equal(results[1].pubDate.getTime(), new Date('2014-10-19T20:43:00Z').getTime());
      });
    });
  });

  describe('Item |', function() {

    describe('RSS |', function() {
      var results = [];

      before(function(done) {
        var feeds = [
          rssDir + 'rss.1.xml',
          rssDir + 'rss.2.xml',
          rssDir + 'rss.3.xml'
        ];

        helper.getFeedResults('item', feeds, function (data) {
          results = data;
          done();
        });
      });

      it('should parse pubDate as top priority', function () {
        assert.equal(results[0][0].pubDate.getTime(), new Date('Fri, 19 Jun 2015 20:15:28 +0000').getTime());
      });

      it('should parse dc:date as next priority', function () {
        assert.equal(results[1][0].pubDate.getTime(), new Date('2015-06-23T07:37:20Z').getTime());
      });

      it('should parse publishedDate as last priority', function () {
        assert.equal(results[2][0].pubDate.getTime(), new Date('2015-01-11T01:50:00Z').getTime());
      });
    });

    describe('ATOM |', function() {
      var results = [];

      before(function(done) {
        var feeds = [
          atomDir + 'atom.1.xml',
          atomDir + 'atom.2.xml'
        ];

        helper.getFeedResults('item', feeds, function (data) {
          results = data;
          done();
        });
      });

      it('should parse published as top priority', function () {
        assert.equal(results[0][0].pubDate.getTime(), new Date('Mon, 22 Jun 2015 13:49:00 PST').getTime());
      });

      it('should parse dc:date as next priority', function () {
        assert.equal(results[1][0].pubDate.getTime(), new Date('2014-10-19T20:43:00Z').getTime());
      });
    });

  });

});