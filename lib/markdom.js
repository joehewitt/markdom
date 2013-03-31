
var _markdom = require('../build/Release/_markdom');
var NodeTypes = require('./nodes');
var NodeHandler = require('./NodeHandler').NodeHandler;
var NodeTransformer = require('./NodeTransformer').NodeTransformer;

// *************************************************************************************************

exports.toDOM = function(source, options, transformer) {
    var handler = new NodeHandler();

    var ids = _markdom.toDOM(source, handler, options || {});
    var rootNodes = handler.getNodes(ids);
    if (transformer) {
        transformer.visit(rootNodes);
    }
    return rootNodes;
}

exports.toHTML = function(source, options, transformer) {
    if (source instanceof NodeTypes.Node) {
        return source.toHTML();
    } else {
        if (transformer) {
            var nodes = exports.toDOM(source, options, transformer);
            return nodes.toHTML();
        } else {
            return _markdom.toHTML(source, options || {});
        }
    }
}

exports.nodeTypes = NodeTypes;
exports.NodeTransformer = NodeTransformer;
