var path = require('path'),
    assert = require('assert'),
    vows = require('vows');

require.paths.unshift(path.join(__dirname, '..', 'lib'));

var markdom = require('markdom');
var fs = require('fs');
var _ = require('underscore');

// *************************************************************************************************

vows.describe('markdom basics').addBatch({
    'blah': {
        topic: 'blah',
        
        testNothing: function() {
        }
    },
}).export(module);
