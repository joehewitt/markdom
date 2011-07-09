var path = require('path'),
    assert = require('assert'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var markdom = require('markdom');
var flickr = require('flickr-reflection');
var fs = require('fs');
var _ = require('underscore');

var flickrOptions = {
    key: '379e503c91f1a375a1e8d1cc4b319caf',
    secret: '6f933c11df597e28',
    apis: ['photos']
};

// *************************************************************************************************

vows.describe('markdom basics').addBatch({
    'blah': {
        topic: 'blah',
        
        testNothing: function() {
            fs.readFile('/Users/joehewitt/Code/tests/markdom.md', 'utf8', function(err, body) {
                var transformer = new FlickrTransformer();
                var html = markdom.toDOM(body, {}, transformer);
                transformer.loadImages(function() {
                    console.log(html.toHTML());
                });
                // console.log(markdom.toHTML(body));
            });
        }
    },
}).export(module);

// *************************************************************************************************

function FlickrTransformer() {
    this.flickrImages = [];
}

FlickrTransformer.prototype = _.extend(new markdom.NodeTransformer(), {
    rePhotoURL: /http:\/\/(.*?)\.flickr\.com\/photos\/(.*?)\/(.*?)\//,
    
    header: function(node) {
        if (node.level == 1) {
            return new markdom.nodeTypes.Text('');
        } else {
            return node;
        }
    },
    
    image: function(node) {
        var flickrURL = node.url;
        var m = this.rePhotoURL.exec(flickrURL);
        if (m) {
            var photoId = m[3];

            var newImage = new markdom.nodeTypes.Image('');
            this.flickrImages[photoId] = newImage;
            var link = new markdom.nodeTypes.Link(flickrURL, null, newImage);
            return link;
        }
    },

    loadImages: function(cb) {
        flickr.connect(flickrOptions, _.bind(function(err, api) {
            if (err) throw err;

            for (var photoId in this.flickrImages) {
                api.photos.getSizes({photo_id: photoId}, _.bind(function(err, data) {
                    if (err) throw err;

                    for (var i = 0; i < data.sizes.size.length; ++i) {
                        var sizeInfo = data.sizes.size[i];
                        if (sizeInfo.width > 600) {
                            this.flickrImages[photoId].url = sizeInfo.source;
                            cb();
                            break;
                        }
                    }
                }, this));
            }
        }, this));
        
    }
});
