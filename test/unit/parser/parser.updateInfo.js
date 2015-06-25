describe('Parser | Update Info |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [rssDir + 'rss.1.xml'];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse updateInfo when available', function () {
      var updateInfo = results[0].updateInfo;
      expect(updateInfo.ttl).to.equal('10');
      expect(updateInfo.period).to.equal('hourly');
      expect(updateInfo.frequency).to.equal('1');
      expect(updateInfo.base).to.equal('yyyy-mm-ddThh:mm');
    });
  });

});