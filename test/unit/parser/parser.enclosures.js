describe('Parser | Enclosure |', function() {
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

    it('should parse all RSS enclosures without duplicates', function () {
      expect(results[0][0].enclosures).to.deep.equal([
          {'type': 'image/jpeg', 'url': 'https://testcontent.com/type.jpg?w=300'},
          {'type': 'image', 'url': 'https://testcontent.com/medium.jpg?w=300'},
          {'url': 'http://media.test.com/media/image/153/1535447.jpg'},
          {'length': '2222', 'type': 'image/jpeg', 'url': 'http://www.test.com/image/view/-/test.jpg'},
          {'length': '8888', 'type': 'image/jpeg', 'url': 'http://www.testenc.com/test.jpg'},
          {'length': '4322', 'type': 'image/jpeg', 'url': 'http://www.testrdf.com/test.jpg'}
        ]
      );
    });

    it('should parse all ATOM enclosures without duplicates', function () {
      expect(results[1][0].enclosures).to.deep.equal([
          {'length': '634706', 'type': 'image/jpg', 'url': 'http://media.test.com/1234.jpg'},
          {'type': 'image/jpg', 'url': 'http://media.test.com/test.jpg'}
        ]
      );
    });
  });

});