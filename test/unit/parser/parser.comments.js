describe('Parser | Comments |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml',
        atomDir + 'atom.2.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse comments when available', function () {
      expect(results[0][0].comments).to.equal('http://testcomments.com/#comments');
    });

    it('should parse link[rel=replies] and choose the type text/html when multiples are defined', function () {
      expect(results[1][0].comments).to.equal('http://www.test.com/comment.g?blogID=1234');
    });

    it('should parse link[rel=replies] and choose the type text/html when multiples are defined regardless of order', function () {
      expect(results[2][0].comments).to.equal('http://www.test.com/comment.g?blogID=1234');
    });
  });

});