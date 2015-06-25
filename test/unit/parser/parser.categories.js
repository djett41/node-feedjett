describe('Parser | Categories |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        rssDir + 'rss.2.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse rss.1.xml, which contains all possible category elements correctly', function () {
      expect(results[0].categories).to.deep.equal([
          'Home',
          'Scout.com > NFL > National League Team',
          'Sports & Recreation',
          'Professional',
          'Seabass'
        ]
      );
    });

    it('should parse rss.1.xml, which contains categories in which values can be split correctly', function () {
      expect(results[1].categories).to.deep.equal([
          'Arts',
          'Brushes',
          'Movies',
          'Titles',
          'A',
          'Ace_Ventura_Series',
          'Ace_Ventura_ -_Pet_Detective'
        ]
      );
    });
  });

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

    it('should parse rss.1.xml categories correctly', function () {
      expect(results[0][0].categories).to.deep.equal([
          'Game Day',
          'JETBLAST 2014-15',
          'Adam Lowry',
          'Anaheim Ducks',
          'popular',
          'Ricard Rakell',
          'Winnipeg Jets'
        ]
      );
    });

    it('should parse atom.1.xml, which contains category elements with term attributes', function () {
      expect(results[1][0].categories).to.deep.equal([
          'Crazy News',
          'Political News',
          'cat:Top Stories'
        ]
      );
    });
  });

});