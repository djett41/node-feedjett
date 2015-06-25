describe('Parser | Copyright |', function() {
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
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse the copyright tag as 1st priority', function () {
      expect(results[0].copyright).to.equal('Copyright © 2015 Test.com. All rights reserved.');
    });

    it('should parse the rights tag as 2nd priority', function () {
      expect(results[1].copyright).to.equal('© 2015 Test rights LLC');
    });

    it('should parse dc:rights tag as 3rd priority', function () {
      expect(results[2].copyright).to.equal('Copyright © 2015 Test.com. dc:rights');
    });

    it('should parse RSS media:copyright tags as last priority', function () {
      expect(results[3].copyright).to.equal('Copyright © 2015 Test.com. media:copyright');
    });

  });

});