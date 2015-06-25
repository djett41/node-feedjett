describe('Parser | Content |', function() {
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

    it('should parse content:encoded as top priority', function () {
      expect(results[0][0].content).to.equal('<div class="center"><img src="https://test.com" width="388" height="291" /></div>');
    });

    it('should parse content when content:encoded isn\'t available and resolve xml base', function () {
      expect(results[1][0].content).to.equal('<img alt="" src="https://test.jpg/"></img><blockquote lang="en"><p lang="en" dir="ltr">paragraph</p>block</blockquote>');
    });
  });

});