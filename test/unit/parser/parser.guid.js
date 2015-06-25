describe('Parser | Guid |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

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

    it('should parse guid as top priority', function () {
      expect(results[0][0].guid).to.equal('http://guid_test.com/?p=43272');
    });

    it('should parse id when guid isn\'t available', function () {
      expect(results[1][0].guid).to.equal('http://id_test.com/?p=28146');
    });
  });

});