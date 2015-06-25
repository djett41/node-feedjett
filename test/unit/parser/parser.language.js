describe('Parser | Language |', function() {
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

    it('should parse language tag as top priority', function () {
      expect(results[0].language).to.equal('en-us');
    });

    it('should parse xml:lang attribute as second priority', function () {
      expect(results[1].language).to.equal('en-US');
    });

    it('should parse dc:language as last priority', function () {
      expect(results[2].language).to.equal('en-us (dc)');
    });
  });

});