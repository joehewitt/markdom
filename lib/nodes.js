
var _ = require('underscore');

// *************************************************************************************************

function openTag(tagName, className) {
    return '<' + tagName + (className ? ' class="' + className + '"' : '');
}

// *************************************************************************************************

function Node() {
    
}

Node.prototype  = {
    visit: function(visitor) {
    },
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function NodeSet(nodes) {
    this.nodes = nodes || [];
}

NodeSet.prototype = subclass(Node, {
    visit: function(visitor) {
        this.nodes = _.map(this.nodes, function(node) { return visitor.visit(node); });
    },
    
    toHTML: function() {
        return _.map(this.nodes, function(node) { return node.toHTML(); }).join('');
    },

    toMarkdown: function(indent) {
        return _.map(this.nodes, function(node) { return node.toMarkdown(indent); }).join('');
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Header(level, content) {
    this.level = level;
    this.content = content;
}

Header.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        var tag = 'h' + this.level;
        return '<' + tag + '>' + this.content.toHTML() + '</' + tag + '>';
    },
    
    toMarkdown: function() {
        return '#' + this.level + ' ' + this.content.toMarkdown() + '\n\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function HRule() {
}

HRule.prototype = subclass(Node, {
    toHTML: function() {
        return '<hr>';
    },
    
    toMarkdown: function() {
        return '------\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function LineBreak() {
}

LineBreak.prototype = subclass(Node, {
    toHTML: function() {
        return '<br>';
    },
    
    toMarkdown: function() {
        return '\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Paragraph(content) {
    this.content = content;
}

Paragraph.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return '<p>' + this.content.toHTML() + '</p>';
    },
    
    toMarkdown: function() {
        return this.content.toMarkdown() + '\n\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Blockquote(content) {
    this.content = content;
}

Blockquote.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return '<blockquote>' + this.content.toHTML() + '</blockquote>';
    },
    
    toMarkdown: function() {
        return '> ' + this.content.toMarkdown() + '\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function BlockCode(lang, text) {
    this.lang = lang;
    this.text = text;
}

BlockCode.prototype = subclass(Node, {
    toHTML: function() {
        return '<pre><code>' + escapeHTML(this.text) + '</code></pre>';
    },

    toMarkdown: function(indent) {
        return _.map(this.text.split('\n'), function(line) {
            return '    ' + line;
        }).join('\n');
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function BlockHTML(text) {
    this.text = text;
}

BlockHTML.prototype = subclass(Node, {
    toHTML: function() {
        return this.text;
    },

    toMarkdown: function(indent) {
        return this.text;
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function List(ordered, items) {
    this.ordered = ordered;
    this.items = items;
}

List.prototype = subclass(Node, {
    visit: function(visitor) {
        this.items = visitor.visit(this.items);
    },    

    toHTML: function() {
        var tag = this.ordered ? 'ol' : 'ul';
        return '<' + tag + '>' + this.items.toHTML() + '</' + tag + '>';
    },

    toMarkdown: function(indent) {
        if (!indent) indent = '';
        var items = [];
        _.each(this.items.nodes, function(node) {
            items.push(node.toMarkdown(indent));
        });
        return items.join('\n')
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function ListItem(content) {
    this.content = content;
}

ListItem.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return '<li>' + this.content.toHTML() + '</li>';
    },

    toMarkdown: function(indent) {
        if (!indent) indent = '';
        return indent + '* ' + this.content.toMarkdown(indent+'    ') + '\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Table(header, body) {
    this.header = header;
    this.body = body;
}

Table.prototype = subclass(Node, {
    visit: function(visitor) {
        this.header = visitor.visit(this.header);
        this.body = visitor.visit(this.body);
    },
    
    toHTML: function() {
        return '<table><th>' + this.header.toHTML() + '</th>'
               + '<tbody>' + this.body.toHTML() + '</tbody></table>';
    },

    toMarkdown: function(indent) {
        var header = this.header.nodes.length
            ? _.map(this.header.nodes, function(node) { return node.toMarkdown(indent); }).join('\n')
            : '';
        var body = this.body.nodes.length
            ? _.map(this.body.nodes, function(node) { return node.toMarkdown(indent); }).join('\n')
            : '';
        return header && body ? header + '\n-------\n' + body : (header || body);
          
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function TableRow(cells) {
    this.cells = cells;
}

TableRow.prototype = subclass(Node, {
    visit: function(visitor) {
        this.cells = visitor.visit(this.cells);
    },
    
    toHTML: function() {
        return '<tr>' + this.cells.toHTML() + '</tr>';
    },

    toMarkdown: function(indent) {
        return _.map(this.cells.nodes, function(node) {
                    return node.toMarkdown(indent);
                }).join(' | ');
    }
});
     
// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function TableCell(content, align) {
    this.content = content;
    this.align = ['', 'left', 'right', 'center'][align];
}

TableCell.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return '<td>' + this.content.toHTML() + '</td>';
    },

    toMarkdown: function(indent) {
        return this.content.toMarkdown(indent);
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Emphasis(depth, content) {
    this.depth = depth;
    this.content = content;
}

Emphasis.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        if (this.depth == 1) {
            return '<em>' + this.content.toHTML() + '</em>';
        } else if (this.depth == 2) {
            return '<strong>' + this.content.toHTML() + '</strong>';
        } else if (this.depth == 3) {
            return '<strong><em>' + this.content.toHTML() + '</em></strong>';
        }
    },

    toMarkdown: function() {
        return '*' + this.depth + ':' + this.content.toMarkdown() + '*';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Strikethrough(content) {
    this.content = content;
}

Strikethrough.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return '<strike>' + this.content.toHTML() + '</strike>';
    },

    toMarkdown: function() {
        return '~~' + this.content.toMarkdown() + '~~';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function CodeSpan(text) {
    this.text = text;
}

CodeSpan.prototype = subclass(Node, {
    toHTML: function() {
        return '<code>' + escapeHTML(this.text) + '</code>';
    },
    
    toMarkdown: function(indent) {
        return '`' + this.text + '`';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Link(url, title, content) {
    this.url = url;
    this.title = title;
    this.content = content;
}

Link.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    toHTML: function() {
        return openTag('a', this.className)
               + ' href="' + this.url + '">' + (this.content ? this.content.toHTML() : '') + '</a>';
    },
    
    toMarkdown: function() {
        return '[' + (this.content ? this.content.toMarkdown() : '') + '](' + this.url
                + (this.title ? ' "' + this.title + '"' : '') + ')';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Image(url, title, alt) {
    this.url = url;
    this.title = title;
    this.alt = alt;
}

Image.prototype = subclass(Node, {
    toHTML: function() {
        var w = this.width == undefined ? '' : (' width="' + this.width + '"');
        var h = this.height == undefined ? '' : (' height="' + this.height + '"');
        return openTag('img', this.className) + ' src="' + this.url + '"' + w + h + '>';
    },

    toMarkdown: function() {
        return '![' + (this.alt || '') + '](' + this.url
               + (this.title ? ' "' + this.title + '"' : '') + ')';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Text(text) {
    this.text = text;
}

Text.prototype = subclass(Node, {
    toHTML: function() {
        return this.text;
    },

    toMarkdown: function() {
        return this.text;
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Script(scriptType, scriptText) {
    this.scriptType = scriptType;
    this.scriptText = scriptText;
}

Script.prototype = subclass(Node, {
    toHTML: function() {
        return '<script type="' + this.scriptType + '">' + this.scriptText + '</script>';
    },

    toMarkdown: function() {
        return '';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Embed(url, title, alt, groups, transformer) {
    this.url = url;
    this.title = title;
    this.alt = alt;
    this.groups = groups;
    this.transformer = transformer;
}

Embed.prototype = subclass(Node, {
    key: function() {
        return this.url + '|' + this.alt + '|' + this.title;    
    },

    transform: function(object, cb) {
        if (typeof(object) == "function") { cb = object; object = undefined; }
        
        var args = this.groups.slice();
        if (object) {
            args.unshift(object);
        }
        args.push.apply(args, [this.url, this.title, this.alt, cb]);
        this.transformer.transform.apply(this.transformer, args);
    },

    toHTML: function() {
        return this.content ? this.content.toHTML() : '';
    },

    toMarkdown: function() {
        return this.content ? this.content.toMarkdown() : '';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Raw(html) {
    this.html = html;
}

Raw.prototype = subclass(Node, {
    toHTML: function() {
        return this.html;
    },

    toMarkdown: function() {
        return '';
    }
});

// *************************************************************************************************

function subclass(a, b) {
    function f() {}
    if (a) {
        f.prototype = a.prototype;
    }
    return _.extend(new f(), b);
}

function escapeHTML(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// *************************************************************************************************

exports.Node = Node;
exports.NodeSet = NodeSet;
exports.Paragraph = Paragraph;
exports.Header = Header;
exports.HRule = HRule;
exports.LineBreak = LineBreak;
exports.Blockquote = Blockquote;
exports.BlockCode = BlockCode;
exports.BlockHTML = BlockHTML;
exports.List = List;
exports.ListItem = ListItem;
exports.Table = Table;
exports.TableRow = TableRow;
exports.TableCell = TableCell;
exports.Emphasis = Emphasis;
exports.Strikethrough = Strikethrough;
exports.CodeSpan = CodeSpan;
exports.Link = Link;
exports.Image = Image;
exports.Text = Text;
exports.Script = Script;
exports.Embed = Embed;
exports.Raw = Raw;
