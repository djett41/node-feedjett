describe('FeedJett | Init |', function() {
  var rootdir = __dirname + '/../../../';
  var FeedJett =  require(rootdir + 'lib/feedjett.js');

  it('should initialize instance vars', function () {
    var feedJett = new FeedJett();

    expect(feedJett.meta).to.deep.equal({ '#ns': [], '@': [], '#xml': {} });
    expect(feedJett.isMetaParsed).to.be.false;
    expect(feedJett.stack).to.be.empty;
    expect(feedJett.xmlBase).to.be.empty;
    expect(feedJett.xhtml).to.be.null;
  });

});