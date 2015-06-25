describe('Parser | Comment Rss |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [rssDir + 'rss.1.xml'];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse wfw:commentRss', function () {
      assert.equal(results[0][0].commentRss, 'http://www.test.com/feed/');
    });
  });

});