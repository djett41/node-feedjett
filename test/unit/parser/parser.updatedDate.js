describe('Parser | Updated Date |', function() {
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
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse lastBuildDate to updatedDate for RSS', function () {
      assert.equal(results[0].updatedDate.getTime(), new Date('2015-06-22T21:01:59.000Z').getTime());
    });

    it('should parse updatedDate with invalid timezone to valid date with correct timezone', function () {
      assert.equal(results[1].updatedDate.getTime(), new Date('2015-06-23T05:38:22.000Z').getTime());
    });

    it('should parse updated to updatedDate for ATOM feeds', function () {
      assert.equal(results[2].updatedDate.getTime(), new Date('2014-10-20T05:44:15Z').getTime());
    });
  });

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse a10:updated to updatedDate for RSS feeds', function () {
      assert.equal(results[0][0].updatedDate.getTime(), new Date('2015-06-20T22:51:00.000Z').getTime());
    });

    it('should parse updated to updatedDate for ATOM feeds', function () {
      assert.equal(results[1][0].updatedDate.getTime(), new Date('2015-05-11T16:45:00-04:00').getTime());
    });

  });

});