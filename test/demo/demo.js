describe('Demo | Feeds |', function() {
  var request = require('request');
  var Q = require("q");
  var rootdir = __dirname + '/../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');

  var results = [];

  function getResults (feedUrl) {
    var deferred = Q.defer();
    var articles = [];

    var error = function () {
      deferred.resolve([]);
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
        deferred.resolve(articles);
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

    return deferred.promise;
  }

  before(function(done) {
    var feeds = [
      'http://www.npr.org/rss/rss.php?id=1001',
      'http://www.npr.org/rss/rss.php?id=1014',
      'http://feeds.abcnews.com/abcnews/usheadlines'
    ];

    var promises = feeds.map(function (feedUrl) {
      return getResults(feedUrl);
    });

    Q.all(promises).spread(function () {
      results = results.concat.apply(results, arguments);
      done();
    });

  });

  it('should call afterParseItem and set custom value on all aggregated feed items', function () {
    results.forEach(function (article) {
      console.log(article);
      expect(article.customProp).to.equal('customProp!');
    })
  });
});