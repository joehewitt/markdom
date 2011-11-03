
var NodeTypes = require('./nodes');

// *************************************************************************************************

function NodeTransformer() {
    
}

NodeTransformer.prototype = {
    visit: function(node) {
        node.visit(this);
        if (node instanceof NodeTypes.NodeSet) {
            return this.nodeSet(node);
        } else if (node instanceof NodeTypes.Block) {
            return this.block(node);
        } else if (node instanceof NodeTypes.Span) {
            return this.span(node);
        } else if (node instanceof NodeTypes.Header) {
            return this.header(node);
        } else if (node instanceof NodeTypes.Paragraph) {
            return this.paragraph(node);
        } else if (node instanceof NodeTypes.List) {
            return this.list(node);
        } else if (node instanceof NodeTypes.ListItem) {
            return this.listItem(node);
        } else if (node instanceof NodeTypes.Table) {
            return this.table(node);
        } else if (node instanceof NodeTypes.TableRow) {
            return this.tableRow(node);
        } else if (node instanceof NodeTypes.TableCell) {
            return this.tableCell(node);
        } else if (node instanceof NodeTypes.Blockquote) {
            return this.blockquote(node);
        } else if (node instanceof NodeTypes.BlockCode) {
            return this.blockCode(node);
        } else if (node instanceof NodeTypes.BlockHTML) {
            return this.blockHTML(node);
        } else if (node instanceof NodeTypes.HRule) {
            return this.hrule(node);
        } else if (node instanceof NodeTypes.LineBreak) {
            return this.lineBreak(node);
        } else if (node instanceof NodeTypes.Emphasis) {
            return this.emphasis(node);
        } else if (node instanceof NodeTypes.Strikethrough) {
            return this.strikethrough(node);
        } else if (node instanceof NodeTypes.CodeSpan) {
            return this.codeSpan(node);
        } else if (node instanceof NodeTypes.Link) {
            return this.link(node);
        } else if (node instanceof NodeTypes.Image) {
            return this.image(node);
        } else if (node instanceof NodeTypes.Text) {
            return this.text(node);
        } else {
            return node;
        }
    },
    
    nodeSet: function(node) {
        return node;
    },

    block: function(node) {
        return node;
    },

    span: function(node) {
        return node;
    },

    header: function(node) {
        return node;
    },

    paragraph: function(node) {
        return node;
    },

    list: function(node) {
        return node;
    },

    listItem: function(node) {
        return node;
    },

    table: function(node) {
        return node;
    },

    tableRow: function(node) {
        return node;
    },

    tableCell: function(node) {
        return node;
    },

    blockquote: function(node) {
        return node;
    },

    blockCode: function(node) {
        return node;
    },

    blockHTML: function(node) {
        return node;
    },

    hrule: function(node) {
        return node;
    },

    lineBreak: function(node) {
        return node;
    },

    emphasis: function(node) {
        return node;
    },

    strikethrough: function(node) {
        return node;
    },

    codeSpan: function(node) {
        return node;
    },

    link: function(node) {
        return node;
    },

    image: function(node) {
        return node;
    },

    text: function(node) {
        return node;
    },
};

exports.NodeTransformer = NodeTransformer;
