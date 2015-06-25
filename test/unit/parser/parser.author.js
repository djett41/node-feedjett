describe('Parser | Author |', function() {
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
        atomDir + 'atom.2.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml',
        rssDir + 'rss.5.xml',
        rssDir + 'rss.6.xml',
        rssDir + 'rss.7.xml',
        rssDir + 'rss.8.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse author tag as top priority', function () {
      expect(results[0].author).to.equal('P.D. Starr');
    });

    it('should parse author.name as next highest priority', function () {
      expect(results[1].author).to.equal('Jon Shepherd');
    });

    it('should parse author.email as next highest priority', function () {
      expect(results[2].author).to.equal('noreply@blogger.com');
    });

    it('should parse managingeditor as next highest priority', function () {
      expect(results[3].author).to.equal('editor name');
    });

    it('should parse webmaster as next highest priority', function () {
      expect(results[4].author).to.equal('Web Master');
    });

    it('should parse dc:creator as next highest priority', function () {
      expect(results[5].author).to.equal('Alan Smith');
    });

    it('should parse itunes:author as next highest priority', function () {
      expect(results[6].author).to.equal('John Ricketts');
    });

    it('should parse dc:publisher as next highest priority', function () {
      expect(results[7].author).to.equal('University of Bath');
    });

    it('should parse itunes:owner name as next highest priority', function () {
      expect(results[8].author).to.equal('Itunes Owner Name - An Blog and Mobile Site for iOS and Android');
    });

    it('should parse itunes:owner email as next highest priority', function () {
      expect(results[9].author).to.equal('matt@test.com');
    });
  });

  describe('Item |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml',
        atomDir + 'atom.2.xml',
        rssDir + 'rss.2.xml',
        rssDir + 'rss.3.xml',
        rssDir + 'rss.4.xml',
        rssDir + 'rss.5.xml',
        rssDir + 'rss.6.xml'
      ];

      helper.getFeedResults('item', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse author tag as top priority', function () {
      expect(results[0][0].author).to.equal('P.D. Starr');
    });

    it('should parse author.name as next highest priority', function () {
      expect(results[1][0].author).to.equal('Jon Shepherd');
    });

    it('should parse author.email as next highest priority', function () {
      expect(results[2][0].author).to.equal('noreply@blogger.com');
    });

    it('should parse dc:creator as next highest priority', function () {
      expect(results[3][0].author).to.equal('Alan Smith');
    });

    it('should parse itunes:author as next highest priority', function () {
      expect(results[4][0].author).to.equal('John Ricketts');
    });

    it('should parse dc:publisher as next highest priority', function () {
      expect(results[5][0].author).to.equal('University of Bath');
    });

    it('should parse itunes:owner name as next highest priority', function () {
      expect(results[6][0].author).to.equal('Itunes Owner Name - An Blog and Mobile Site for iOS and Android');
    });

    it('should parse itunes:owner email as next highest priority', function () {
      expect(results[7][0].author).to.equal('matt@test.com');
    });
  });

});