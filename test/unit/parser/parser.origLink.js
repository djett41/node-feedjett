describe('Parser | Orig Link |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml',
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse feedburner:origlink tag a top priority', function () {
      expect(results[0][0].origLink).to.equal('http://www.test.com/feedburner/resource');
    });

    it('should parse pheedo:origlink as next highest priority', function () {
      expect(results[1][0].origLink).to.equal('http://www.test.com/pheedo/resource');
    });

    it('should parse link[rel=canonical] as next highest priority', function () {
      expect(results[2][0].origLink).to.equal('http://www.example.com/product.php?item=swedish-fish');
    });

  });

});