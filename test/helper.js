var rootdir = __dirname + '/../';
var FeedJett =  require(rootdir + 'lib/feedjett.js');

/**
 * Reorders the results in the order they came.  This let's us test results in confidence since streams can emit
 * in a different order
 *
 * @param order
 * @param resultMap
 * @returns {Array|*}
 */
function reorderResults(order, resultMap) {
  return order.map(function (feedFile) {
    return resultMap[feedFile];
  });
}

/**
 * Helper for aggregating meta and item results
 *
 * @param type
 * @param feeds
 * @param done
 */
function getFeedResults (type, feeds, done) {
  var resultMap = {},
      count = 0,
      order = [];

  if (!(feeds && feeds.length)) {
    done([]);
  }

  var onEnd = function (data, feed) {
    resultMap[feed] = data;
    count++;
    if (count === feeds.length) {
      var results = reorderResults(order, resultMap);
      done(results);
    }
  };

  feeds.forEach(function (feed) {
    order.push(feed);

    var feedJett = new FeedJett({feedUrl: feed}), itemResults;

    if (type === 'meta') {
      feedJett.on('meta', function (meta) {
        onEnd(meta, feed);
      });
    } else {
      itemResults = [];
      feedJett.on('readable', function () {
          itemResults.push(this.read());
        })
        .on('end', function () {
          onEnd(itemResults, feed);
        });
    }

    fs.createReadStream(feed).pipe(feedJett);
  });
}
exports.getFeedResults = getFeedResults;