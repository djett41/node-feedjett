describe('Parser | Cloud |', function() {
  var rootdir = __dirname + '/../../../';
  var helper =  require(rootdir + 'test/helper.js');
  var rssDir = rootdir + 'test/feeds/rss/';
  var atomDir = rootdir + 'test/feeds/atom/';

  describe('Meta |', function() {
    var results = [];

    before(function(done) {
      var feeds = [
        rssDir + 'rss.1.xml',
        atomDir + 'atom.1.xml'
      ];

      helper.getFeedResults('meta', feeds, function (data) {
        results = data;
        done();
      });
    });

    it('should parse cloud tag a top priority', function () {
      expect(results[0].cloud).to.deep.equal({
        type: 'rsscloud',
        domain: 'testsite.com',
        path: '/?rsscloud=notify',
        port: '80',
        protocol: 'http-post',
        registerprocedure: ''
      });
    });

    it('should parse link[rel=hub] as next highest priority', function () {
      expect(results[1].cloud).to.deep.equal({
        type: 'hub',
        href: 'http://www.example.com/hub'
      });
    });
  });

});