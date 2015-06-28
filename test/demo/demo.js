describe('Demo | Feeds |', function() {
  var request = require('request');
  var rootdir = __dirname + '/../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');

  var results = [];

  function getResults (feedUrl, callback) {
    var articles = [];

    var error = function () {
      callback([]);
    };

    var afterParseItem = function (item, feedType) {
      item.customProp = 'customProp!';
    };

    var feedParser = new FeedJett({ parseRawNode: true, feedUrl: feedUrl, afterParseItem: afterParseItem });
    feedParser.on('readable', function () {
      var article;
      while (article = this.read()) {
        articles.push(article);
      }
    }).on('end', function () {
      callback(articles);
      })
      .on('error', error);

    request(feedUrl, {pool: false})
      .on('response', function (res) {
        if (res.statusCode != 200) {
          return this.emit('error', new Error('Bad status code'));
        }
        res.pipe(feedParser);
      })
      .on('error', error);
  }

  before(function(done) {
    var feeds = [
      'http://www.npr.org/rss/rss.php?id=1001',
      'http://www.npr.org/rss/rss.php?id=1014',
      'http://feeds.abcnews.com/abcnews/usheadlines'
    ];
    var count = 0;

    feeds.forEach(function (feedUrl) {
      getResults(feedUrl, function (headlines) {
        count++;
        results = results.concat(headlines);
        if (count === feeds.length) {
          done();
        }
      })
    });

  });

  it('should call afterParseItem and set custom value on all aggregated feed items', function () {
    results.forEach(function (article) {
      console.log(article);
      expect(article.customProp).to.equal('customProp!');
    })
  });
});