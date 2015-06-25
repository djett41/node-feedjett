describe('Parser | Link |', function() {
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
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml',
        rssDir + 'rss.5.xml',
        rssDir + 'rss.6.xml',
        rssDir + 'rss.7.xml',
        atomDir + 'atom.1.xml',
        atomDir + 'atom.2.xml',
        atomDir + 'atom.3.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse link tag content as top priority', function () {
      expect(results[0].link).to.equal('http://testlink/somelink');
    });

    it('should parse 1st link tag if there are multiple and link tag has text content', function () {
      expect(results[1].link).to.equal('http://testlink/firstlink');
    });

    it('should parse atom:link as next priority', function () {
      expect(results[2].link).to.equal('http://example.com/self.xml');
    });

    it('should parse atom10 as next priority', function () {
      expect(results[3].link).to.equal('http://atom10.com/self');
    });

    it('should be undefined if atom10 is defined but type is application/rss+xml', function () {
      expect(results[4].link).to.not.be.defined;
    });

    it('should be undefined if link can not be derived and atom:id does not begin with http', function () {
      expect(results[5].link).to.not.be.defined;
    });
    it('should parse atom:id if link can not be derived and atom:id begins with http', function () {
      expect(results[6].link).to.equal('https://atomid/test');
    });

    it('should parse link[rel=alternate] before any other rel type if the type is undefined or text/html', function () {
      expect(results[7].link).to.equal('http://www.example.com/alternate');
    });

    it('should be undefined if link is defined but type is application/rss+xml', function () {
      expect(results[8].link).to.not.be.defined;
    });

    it('should parse link[rel=self] even if rel=aleternate is defined but type is defined and not test/html', function () {
      expect(results[9].link).to.equal('http://www.example.com/self.xml');
    });

  });

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse link tag content as top priority', function () {
      expect(results[0][0].link).to.equal('http://link/somelink');
    });

    it('should be undefined if link can not be derived and guid does not begin with http', function () {
      expect(results[1][0].link).to.not.be.defined;
    });

    it('should parse guid if link can not be derived and guid begins with http', function () {
      expect(results[2][0].link).to.equal('http://guid_test.com/?p=43272');
    });

    it('should parse link[rel=alternate] before any other rel type if the type is undefined or text/html', function () {
      expect(results[3][0].link).to.equal('http://www.example.com/alternate');
    });
  });

});