
var NodeTypes = require('./nodes');

// *************************************************************************************************

function NodeHandler(context) {
    this.nodes = {};
    this.nodeCount = 0;
    this.context = context;
    this.embeds = [];
}
exports.NodeHandler = NodeHandler;

NodeHandler.prototype = {
    header: function(level, content) {
        return this.createNode(new NodeTypes.Header(level, this.getNodes(content)));
    },

    paragraph: function(content) {
        return this.createNode(new NodeTypes.Paragraph(this.getNodes(content)));
    },

    blockquote: function(content) {
        return this.createNode(new NodeTypes.Blockquote(this.getNodes(content)));
    },

    blockCode: function(lang, text) {
        return this.createNode(new NodeTypes.BlockCode(lang, text));
    },

    blockHTML: function(text) {
        return this.createNode(new NodeTypes.BlockHTML(text));
    },

    list: function(level, content) {
        return this.createNode(new NodeTypes.List(level, this.getNodes(content)));
    },

    listItem: function(content) {
        return this.createNode(new NodeTypes.ListItem(this.getNodes(content)));
    },

    table: function(header, body) {
        return this.createNode(new NodeTypes.Table(this.getNodes(header), this.getNodes(body)));
    },

    tableRow: function(cells) {
        return this.createNode(new NodeTypes.TableRow(this.getNodes(cells)));
    },

    tableCell: function(content, align) {
        return this.createNode(new NodeTypes.TableCell(this.getNodes(content), align));
    },

    hrule: function() {
        return this.createNode(new NodeTypes.HRule());
    },

    lineBreak: function() {
        return this.createNode(new NodeTypes.LineBreak());
    },

    emphasis: function(depth, content) {
        return this.createNode(new NodeTypes.Emphasis(depth, this.getNodes(content)));
    },

    strikethrough: function(content) {
        return this.createNode(new NodeTypes.Strikethrough(this.getNodes(content)));
    },

    codeSpan: function(text) {
        return this.createNode(new NodeTypes.CodeSpan(text));
    },

    link: function(url, title, content) {
        return this.createNode(new NodeTypes.Link(url, title, this.getNodes(content)));
    },

    autolink: function(url, type) {
        return this.createNode(new NodeTypes.Link(url, '',
                               new NodeTypes.NodeSet([new NodeTypes.Text(url)])));
    },
    
    image: function(url, title, alt) {
        var id = this.createNode(new NodeTypes.Image(url, title, alt));
        if (id > 0) {
            // Don't blame me for this hack, I am just replicating what Upskirt already does
            // in markdown.c. Yes, it actually goes back in the buffer and erases the ! before
            // the image syntax.
            var prev = this.nodes[id-1];
            if (prev instanceof NodeTypes.Text) {
                prev.text = prev.text.slice(0, prev.text.length-1);
            }
        }
        return id;
    },

    text: function(text) {
        return this.createNode(new NodeTypes.Text(text));
    },
    
    // * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
    
    createNode: function(node) {
        var nodeId = this.nodeCount++;
        this.nodes[nodeId] = node;
        return nodeId;
    },
    
    getNodes: function(ids) {
        var nodes = [];
        if (ids) {
            var idns = ids.split(',');
            var lastNode;
            for (var i = 0; i < idns.length; ++i) {
                var id = idns[i];
                var node = this.nodes[id];
                if (node) {
                    if (node instanceof NodeTypes.Text && lastNode instanceof NodeTypes.Text) {
                        lastNode.text += node.text;
                    } else {
                        nodes.push(node);
                        lastNode = node;
                    }
                }
            }
        }
        return new NodeTypes.NodeSet(nodes);
    }
};
