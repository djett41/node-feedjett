describe('Parser | Source |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should', function () {
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

      it('should parse source as highest priority', function () {
        expect(results[0][0].source).to.deep.equal({
          title: 'Test Feeds',
          url: 'http://testsports.com/rss'
        });
      });

      it('should parse source and only include title if url is not available', function () {
        expect(results[1][0].source).to.deep.equal({
          title: 'Test Feeds'
        });
      });

      it('should parse source and only include url if title is not available', function () {
        expect(results[2][0].source).to.deep.equal({
          url: 'http://testsports.com/rss'
        });
      });
    });

    describe('ATOM |', function() {
      var results = [];

      before(function(done) {
        var feeds = [
          atomDir + 'atom.1.xml',
          atomDir + 'atom.2.xml',
          atomDir + 'atom.3.xml'
        ];

        helper.getFeedResults('item', feeds, function (data) {
          results = data;
          done();
        });
      });

      it('should parse source as highest priority', function () {
        expect(results[0][0].source).to.deep.equal({
          title: 'Test Feeds',
          url: 'http://testsports.com/atom'
        });
      });

      it('should parse source and only include title if url is not available', function () {
        expect(results[1][0].source).to.deep.equal({
          title: 'Test Feeds'
        });
      });

      it('should parse source and only include url if title is not available', function () {
        expect(results[2][0].source).to.deep.equal({
          url: 'http://testsports.com/atom'
        });
      });
    });

  });

});