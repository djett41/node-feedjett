describe('Parser | Generator |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse only generator tag as top priority', function () {
      expect(results[0].generator).to.equal('Blogger');
    });

    it('should parse generator tag plus version attribute', function () {
      expect(results[1].generator).to.equal('Blogger v7.00');
    });

    it('should parse generator tag plus version and uri attribute', function () {
      expect(results[2].generator).to.equal('Blogger v7.00 http://www.blogger.com/');
    });

    it('should parse admin:generatoragent rdf:resource attribute as last priority', function () {
      expect(results[3].generator).to.equal('http://testengine.com/');
    });
  });

});