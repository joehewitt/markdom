
var _ = require('underscore');

// *************************************************************************************************

function Node() {
    
}

Node.prototype  = {
    visit: function(visitor) {
    },

    setStyle: function(name, value) {
        if (!this.styles) {
            this.styles = [];
        }
        this.styles.push(name + ':' + value);
    },

    setAttribute: function(name, value) {
        if (!this.attributes) {
            this.attributes = {};
        }
        this.attributes[name] = value;
    },

    removeAttribute: function(name) {
        if (this.attributes) {
            delete this.attributes[name];            
        }
    },

    addClass: function(name) {
        if (!this.classes) {
            this.classes = [];
        }
        this.classes.push(name);
    },

    openTag: function(tag, leaveOpen) {
        var classNode = this;
        var attrs = '';
        if (this.content && this.content.nodes) {
            var lastNode = this.content.nodes[this.content.nodes.length-1];
            if (lastNode && lastNode.classes) {
                classNode = lastNode;
            }
        }

        if (classNode.classes) {
            attrs += ' class="' + classNode.classes.join(' ') + '"';
        } else if (classNode.className) {
            attrs += ' class="' + classNode.className + '"';
        }

        if (this.styles) {
            attrs += ' style="' + this.styles.join(';') + '"';
        }

        if (classNode.attributes) {
            for (var name in classNode.attributes) {
                attrs += ' ' + name + '="' + classNode.attributes[name] + '"';                
            }
        }

        return '<' + tag + attrs + (leaveOpen ? '' : '>');
    }
};

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function NodeSet(nodes) {
    this.nodes = nodes || [];
}

NodeSet.prototype = subclass(Node, {
    visit: function(visitor) {
        this.nodes = _.map(this.nodes, function(node) { return visitor.visit(node); });
    },
    
    clone: function() {
        var nodes = _.map(this.nodes, function(node) { return node.clone(); });
        return cloneFix(new NodeSet(nodes), this);
    },

    toText: function() {
        return _.map(this.nodes, function(node) { return node.toText(); }).join('');
    },
    
    toHTML: function() {
        return _.map(this.nodes, function(node) { return node.toHTML(); }).join('');
    },

    toMarkdown: function(indent) {
        return _.map(this.nodes, function(node) { return node.toMarkdown(indent); }).join('');
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Block(content) {
    this.content = content;
}

Block.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    clone: function() {
        return cloneFix(new Block(this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('div') + (this.content ? this.content.toHTML() : '')+ '</div>';
    },
    
    toMarkdown: function() {
        return this.content.toMarkdown();
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Span(content) {
    this.content = content;
}

Span.prototype = subclass(Node, {
    visit: function(visitor) {
        this.content = visitor.visit(this.content);
    },
    
    clone: function() {
        return cloneFix(new Span(this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('span') + (this.content ? this.content.toHTML() : '')+ '</span>';
    },
    
    toMarkdown: function() {
        return this.content.toMarkdown();
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
    
    clone: function() {
        return cloneFix(new Header(this.level, this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        var tag = 'h' + this.level;
        return this.openTag(tag) + this.content.toHTML() + '</' + tag + '>';
    },
    
    toMarkdown: function() {
        return '#' + this.level + ' ' + this.content.toMarkdown() + '\n\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function HRule() {
}

HRule.prototype = subclass(Node, {
    toText: function() {
        return '';
    },

    clone: function() {
        return cloneFix(new HRule(), this);
    },

    toHTML: function() {
        return this.openTag('hr');
    },
    
    toMarkdown: function() {
        return '------\n';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function LineBreak() {
}

LineBreak.prototype = subclass(Node, {
    clone: function() {
        return cloneFix(new LineBreak(), this);
    },

    toText: function() {
        return '';
    },

    toHTML: function() {
        return this.openTag('br');
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

    clone: function() {
        return cloneFix(new Paragraph(this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },
    
    toHTML: function() {
        return this.openTag('p') + this.content.toHTML() + '</p>';
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
    
    clone: function() {
        return cloneFix(new Blockquote(this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('blockquote') + this.content.toHTML() + '</blockquote>';
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
    toText: function() {
        return this.text;
    },

    clone: function() {
        return cloneFix(new BlockCode(this.lang, this.text), this);
    },

    toHTML: function() {
        return this.openTag('pre') + '<code>' + escapeHTML(this.text) + '</code></pre>';
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
    clone: function() {
        return cloneFix(new BlockHTML(this.text), this);
    },

    toText: function() {
        return this.text;
    },

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

    clone: function() {
        var items = _.map(this.items, function(node) { return item.clone(); });
        return cloneFix(new Line(this.ordered, items), this);
    },

    toText: function() {
        return this.items.toText();
    },

    toHTML: function() {
        var tag = this.ordered ? 'ol' : 'ul';
        return this.openTag(tag) + this.items.toHTML() + '</' + tag + '>';
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
    
    clone: function() {
        return cloneFix(new ListItem(this.content ? this.content.clone() : null), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('li') + this.content.toHTML() + '</li>';
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
    
    clone: function() {
        var header = this.header ? this.header.clone() : null;
        var body = this.body ? this.body.clone() : null;
        return cloneFix(new Table(header, body), this);
    },

    toText: function() {
        return this.body.toText();
    },

    toHTML: function() {
        return this.openTag('table') + '<th>' + this.header.toHTML() + '</th>'
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
    
    clone: function() {
        var cells = this.cells ? this.cells.clone() : null;
        return TableRow(new TableRow(cells), this);
    },

    toText: function() {
        return this.cells.toText();
    },

    toHTML: function() {
        return this.openTag('tr') + this.cells.toHTML() + '</tr>';
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
    
    clone: function() {
        var content = this.content ? this.content.clone() : null;
        return cloneFix(new TableCell(content, this.align), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('td') + this.content.toHTML() + '</td>';
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
    
    clone: function() {
        var content = this.content ? this.content.clone() : null;
        return cloneFix(new Emphasis(this.depth, content), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        if (this.depth == 1) {
            return this.openTag('em') + this.content.toHTML() + '</em>';
        } else if (this.depth == 2) {
            return this.openTag('strong') + this.content.toHTML() + '</strong>';
        } else if (this.depth == 3) {
            return this.openTag('strong') + '<em>' + this.content.toHTML() + '</em></strong>';
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
    
    clone: function() {
        var content = this.content ? this.content.clone() : null;
        return cloneFix(new Strikethrough(content), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('strike') + this.content.toHTML() + '</strike>';
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
    clone: function() {
        return cloneFix(new CodeSpan(this.text), this);
    },

    toText: function() {
        return this.text;
    },

    toHTML: function() {
        return this.openTag('code') + escapeHTML(this.text) + '</code>';
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
    
    clone: function() {
        var content = this.content ? this.content.clone() : null;
        return cloneFix(new Link(this.url, this.title, content), this);
    },

    toText: function() {
        return this.content.toText();
    },

    toHTML: function() {
        return this.openTag('a', true)
               + ' href="' + this.url + '">' + (this.content ? this.content.toHTML() : '') + '</a>';
    },
    
    toMarkdown: function() {
        return '[' + (this.content ? this.content.toMarkdown() : '') + '](' + this.url
                + (this.title ? ' "' + this.title + '"' : '') + ')';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Image(url, title, alt, width, height) {
    this.url = url;
    this.title = title;
    this.alt = alt;
    this.width = width;
    this.height = height;
}

Image.prototype = subclass(Node, {
    clone: function() {
        return cloneFix(new Image(this.url, this.title, this.alt, this.width, this.height), this);
    },

    toText: function() {
        return '';
    },

    toHTML: function() {
        var w = this.width == undefined ? '' : (' width="' + this.width + '"');
        var h = this.height == undefined ? '' : (' height="' + this.height + '"');
        return this.openTag('img', true) + ' src="' + this.url + '"' + w + h + '>';
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
    clone: function() {
        return cloneFix(new Text(this.text), this);
    },

    toText: function() {
        return this.text;
    },

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
    clone: function() {
        return cloneFix(new Script(this.scriptType, this.scriptText), this);
    },

    toText: function() {
        return '';
    },

    toHTML: function() {
        return '<script type="' + this.scriptType + '">' + this.scriptText + '</script>';
    },

    toMarkdown: function() {
        return '';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Embed(url, title, alt, groups, transformer, query, content) {
    this.url = url;
    this.title = title;
    this.alt = alt;
    this.groups = groups;
    this.transformer = transformer;
    this.query = query;
    this.content = content;
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
        args.push.apply(args, [this.url, this.title, this.alt, this.query, cb]);
        this.transformer.transform.apply(this.transformer, args);
    },

    clone: function() {
        var content = this.content ? this.content.clone() : null;
        return cloneFix(new Embed(this.url, this.title, this.alt, this.groups, this.transformer,
                                  this.query, content), this);
    },

    toText: function() {
        if (this.content) {
            if (this.content instanceof Node) {
                return this.content.toText();
            } else {
                return this.content;
            }
        } else {
            return '';
        }
    },

    toHTML: function() {
        if (this.content) {
            if (this.content instanceof Node) {
                return this.content.toHTML();
            } else {
                return this.content;
            }
        } else {
            return '';
        }
    },

    toMarkdown: function() {
        if (this.content) {
            if (this.content instanceof Node) {
                return this.content.toMarkdown();
            } else {
                return this.content;
            }
        } else {
            return '';
        }
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Raw(html) {
    this.html = html;
}

Raw.prototype = subclass(Node, {
    clone: function() {
        return cloneFix(new Raw(this.html), this);
    },

    toText: function() {
        return '';
    },

    toHTML: function() {
        return this.html;
    },

    toMarkdown: function() {
        return '';
    }
});

// * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *

function Definition(name, value) {
    this.name = name;
    this.value = value
}

Definition.prototype = subclass(Node, {
    clone: function() {
        return cloneFix(new Definition(this.name, this.value), this);
    },

    toText: function() {
        return '';
    },

    toHTML: function() {
        return '';
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

function cloneFix(clone, previous) {
    clone.classes = previous.classes;
    clone.styles = previous.styles;
    return clone;
}

function escapeHTML(text) {
    return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// *************************************************************************************************

exports.Node = Node;
exports.NodeSet = NodeSet;
exports.Block = Block;
exports.Span = Span;
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
exports.Definition = Definition;

