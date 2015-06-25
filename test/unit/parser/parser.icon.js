describe('Parser | Icon |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        atomDir + 'atom.1.xml',
        atomDir + 'atom.2.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse icon and NOT resolve xml:base if icon already defines a host', function () {
      expect(results[0].icon).to.equal('https://upload.wikimedia.org/0/07/Button_Icon_Red.svg');
    });

    it('should add xmlbase to relative path if xml:base is defined', function () {
      expect(results[1].icon).to.equal('http://testbase.com/Button_Icon_Red.svg');
    });
  });

});