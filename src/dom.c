/*
 * Copyright (c) 2009, Natacha Porté
 * Copyright (c) 2011, Vicent Marti
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

#include "markdown.h"
#include "xhtml.h"
#include "bridge.h"

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>

struct xhtml_renderopt {
	struct {
		int header_count;
		int current_level;
	} toc_data;

	struct {
		int in_squote;
		int in_dquote;
	} quotes;

	unsigned int flags;
    void* user;
};

static inline void
put_scaped_char(struct buf *ob, char c)
{
	switch (c) {
		case '<': BUFPUTSL(ob, "&lt;"); break;
		case '>': BUFPUTSL(ob, "&gt;"); break;
		case '&': BUFPUTSL(ob, "&amp;"); break;
		case '"': BUFPUTSL(ob, "&quot;"); break;
		default: bufputc(ob, c); break;
	}
}

/* lus_attr_escape • copy the buffer entity-escaping '<', '>', '&' and '"' */
static void
lus_attr_escape(struct buf *ob, const char *src, size_t size)
{
	size_t  i = 0, org;
	while (i < size) {
		/* copying directly unescaped characters */
		org = i;
		while (i < size && src[i] != '<' && src[i] != '>'
		&& src[i] != '&' && src[i] != '"')
			i += 1;
        // if (i > org) bufput(ob, src + org, i - org);

		/* escaping */
		if (i >= size) break;

        // put_scaped_char(ob, src[i]);
		i++;
	}
}

static int
is_html_tag(struct buf *tag, const char *tagname)
{
	size_t i = 0;

	if (i < tag->size && tag->data[0] != '<')
		return 0;

	i++;

	while (i < tag->size && isspace(tag->data[i]))
		i++;

	if (i < tag->size && tag->data[i] == '/')
		i++;

	while (i < tag->size && isspace(tag->data[i]))
		i++;

	for (; i < tag->size; ++i, ++tagname) {
		if (*tagname == 0)
			break;

		if (tag->data[i] != *tagname)
			return 0;
	}

	if (i == tag->size)
		return 0;

	return (isspace(tag->data[i]) || tag->data[i] == '>');
}

/********************
 * GENERIC RENDERER *
 ********************/
static int
rndr_autolink(struct buf *ob, struct buf *link, enum mkd_autolink type, void *opaque)
{
	struct xhtml_renderopt *options = opaque;

	if (!link || !link->size)
		return 0;

	if ((options->flags & XHTML_SAFELINK) != 0 &&
		!is_safe_link(link->data, link->size) &&
		type != MKDA_EMAIL)
		return 0;
    
    return markdom_handle_autolink(ob, link, type, options->user);
}

static void
rndr_blockcode(struct buf *ob, struct buf *text, struct buf *lang, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    markdom_handle_blockCode(ob, lang, text, options->user);
}

/*
 * GitHub style code block:
 *
 *		<pre lang="LANG"><code>
 *		...
 *		</pre></code>
 *
 * Unlike other parsers, we store the language identifier in the <pre>,
 * and don't let the user generate custom classes.
 *
 * The language identifier in the <pre> block gets postprocessed and all
 * the code inside gets syntax highlighted with Pygments. This is much safer
 * than letting the user specify a CSS class for highlighting.
 *
 * Note that we only generate HTML for the first specifier.
 * E.g.
 *		~~~~ {.python .numbered}	=>	<pre lang="python"><code>
 */
static void
rndr_blockcode_github(struct buf *ob, struct buf *text, struct buf *lang, void *opaque)
{
	if (ob->size) bufputc(ob, '\n');

	if (lang && lang->size) {
		size_t i = 0;
		BUFPUTSL(ob, "<pre lang=\"");

		for (; i < lang->size; ++i)
			if (isspace(lang->data[i]))
				break;

		if (lang->data[0] == '.')
			bufput(ob, lang->data + 1, i - 1);
		else
			bufput(ob, lang->data, i);

		BUFPUTSL(ob, "\"><code>");
	} else
		BUFPUTSL(ob, "<pre><code>");

	if (text)
		lus_attr_escape(ob, text->data, text->size);

	BUFPUTSL(ob, "</code></pre>\n");
}

static void
rndr_blockquote(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    markdom_handle_blockquote(ob, text, options->user);
}

static int
rndr_codespan(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    return markdom_handle_codespan(ob, text, options->user);
}

static int
rndr_strikethrough(struct buf *ob, struct buf *text, void *opaque)
{
	if (!text || !text->size)
		return 0;

	struct xhtml_renderopt *options = opaque;
    return markdom_handle_strikethrough(ob, text, options->user);
}

static int
rndr_double_emphasis(struct buf *ob, struct buf *text, void *opaque)
{
	if (!text || !text->size)
		return 0;

	struct xhtml_renderopt *options = opaque;	
    return markdom_handle_emphasis(ob, 2, text, options->user);
}

static int
rndr_emphasis(struct buf *ob, struct buf *text, void *opaque)
{
	if (!text || !text->size) return 0;

	struct xhtml_renderopt *options = opaque;	
    return markdom_handle_emphasis(ob, 1, text, options->user);
}

static void
rndr_header(struct buf *ob, struct buf *text, int level, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    markdom_handle_header(ob, level, text, options->user);
}

static int
rndr_link(struct buf *ob, struct buf *link, struct buf *title, struct buf *content, void *opaque)
{
	struct xhtml_renderopt *options = opaque;

    if ((options->flags & XHTML_SAFELINK) != 0 && !is_safe_link(link->data, link->size))
     return 0;

    return markdom_handle_link(ob, link, title, content, options->user);
}

static void
rndr_list(struct buf *ob, struct buf *text, int flags, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    markdom_handle_list(ob, flags & MKD_LIST_ORDERED, text, options->user);
}

static void
rndr_listitem(struct buf *ob, struct buf *text, int flags, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    
    if (text) {
         while (text->size && text->data[text->size - 1] == '\n')
             text->size -= 1;
    }
    markdom_handle_listItem(ob, text, options->user);
}

static void
rndr_paragraph(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;

    size_t i = 0;
    
    if (!text || !text->size)
     return;
    
    while (i < text->size && isspace(text->data[i])) i++;
    
    if (i == text->size)
     return;
    
    if (options->flags & XHTML_HARD_WRAP) {
     size_t org;
     while (i < text->size) {
         org = i;
         while (i < text->size && text->data[i] != '\n')
             i++;
    
         if (i >= text->size)
             break;
    
         i++;
     }
    }
    markdom_handle_paragraph(ob, text, options->user);

	/* Close any open quotes at the end of the paragraph */
	options->quotes.in_squote = 0;
	options->quotes.in_dquote = 0;
}

static void
rndr_raw_block(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
    markdom_handle_blockHTML(ob, text, options->user);
}

static int
rndr_triple_emphasis(struct buf *ob, struct buf *text, void *opaque)
{
	if (!text || !text->size) return 0;
	struct xhtml_renderopt *options = opaque;	
    return markdom_handle_emphasis(ob, 3, text, options->user);
	return 1;
}


/**********************
 * XHTML 1.0 RENDERER *
 **********************/

static void
rndr_hrule(struct buf *ob, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    markdom_handle_hrule(ob, options->user);
}

static int
rndr_image(struct buf *ob, struct buf *link, struct buf *title, struct buf *alt, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	

    if (!link || !link->size) return 0;

    return markdom_handle_image(ob, link, title, alt, options->user);
}

static int
rndr_linebreak(struct buf *ob, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    return markdom_handle_lineBreak(ob, options->user);
}

static int
rndr_raw_html(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    return markdom_handle_blockHTML(ob, text, options->user);
}

static void
rndr_table(struct buf *ob, struct buf *header, struct buf *body, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    markdom_handle_table(ob, header, body, options->user);
}

static void
rndr_tablerow(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    markdom_handle_tableRow(ob, text, options->user);
}

static void
rndr_tablecell(struct buf *ob, struct buf *text, int align, void *opaque)
{
	struct xhtml_renderopt *options = opaque;	
    markdom_handle_tableCell(ob, text, align, options->user);
}

static struct {
    char c0;
    const char *pattern;
    const char *entity;
    int skip;
} smartypants_subs[] = {
    { '\'', "'s>",      "&rsquo;",  0 },
    { '\'', "'t>",      "&rsquo;",  0 },
    { '\'', "'re>",     "&rsquo;",  0 },
    { '\'', "'ll>",     "&rsquo;",  0 },
    { '\'', "'ve>",     "&rsquo;",  0 },
    { '\'', "'m>",      "&rsquo;",  0 },
    { '\'', "'d>",      "&rsquo;",  0 },
    { '-',  "--",       "&mdash;",  1 },
    { '-',  "<->",      "&ndash;",  0 },
    { '.',  "...",      "&hellip;", 2 },
    { '.',  ". . .",    "&hellip;", 4 },
    { '(',  "(c)",      "&copy;",   2 },
    { '(',  "(r)",      "&reg;",    2 },
    { '(',  "(tm)",     "&trade;",  3 },
    { '3',  "<3/4>",    "&frac34;", 2 },
    { '3',  "<3/4ths>", "&frac34;", 2 },
    { '1',  "<1/2>",    "&frac12;", 2 },
    { '1',  "<1/4>",    "&frac14;", 2 },
    { '1',  "<1/4th>",  "&frac14;", 2 },
    { '&',  "&#0;",      0,       3 },
};

#define SUBS_COUNT (sizeof(smartypants_subs) / sizeof(smartypants_subs[0]))

static inline int
word_boundary(char c)
{
	return isspace(c) || ispunct(c);
}

static int
smartypants_cmpsub(const struct buf *buf, size_t start, const char *prefix)
{
	size_t i;

	if (prefix[0] == '<') {
		if (start == 0 || !word_boundary(buf->data[start - 1]))
			return 0;

		prefix++;
	}

	for (i = start; i < buf->size; ++i) {
		char c, p;

		c = tolower(buf->data[i]);
		p = *prefix++;

		if (p == 0)
			return 1;

		if (p == '>')
			return word_boundary(c);

		if (c != p)
			return 0;
	}

	return (*prefix == '>');
}

static int
smartypants_quotes(struct buf *ob, struct buf *text, size_t i, int is_open)
{
	char ent[8];

	if (is_open && i + 1 < text->size && !word_boundary(text->data[i + 1]))
		return 0;

	if (!is_open && i > 0 && !word_boundary(text->data[i - 1]))
		return 0;

	snprintf(ent, sizeof(ent), "&%c%cquo;",
		is_open ? 'r' : 'l',
		text->data[i] == '\'' ? 's' : 'd');

	bufputs(ob, ent);
	return 1;
}

static void
rndr_normal_text(struct buf *ob, struct buf *text, void *opaque)
{
	if (text) {
    	struct xhtml_renderopt *options = opaque;
        markdom_handle_text(ob, text, options->user);
	}
}

static void
rndr_smartypants(struct buf *ob, struct buf *text, void *opaque)
{
	struct xhtml_renderopt *options = opaque;
	size_t i;

	if (!text)
		return;

	for (i = 0; i < text->size; ++i) {
		size_t sub;
		char c = text->data[i];

		for (sub = 0; sub < SUBS_COUNT; ++sub) {
			if (c == smartypants_subs[sub].c0 &&
				smartypants_cmpsub(text, i, smartypants_subs[sub].pattern)) {

				if (smartypants_subs[sub].entity)
					bufputs(ob, smartypants_subs[sub].entity);

				i += smartypants_subs[sub].skip;
				break;
			}
		}

		if (sub < SUBS_COUNT)
			continue;

		switch (c) {
		case '\"':
			if (smartypants_quotes(ob, text, i, options->quotes.in_dquote)) {
				options->quotes.in_dquote = !options->quotes.in_dquote;
				continue;
			}
			break;

		case '\'':
			if (smartypants_quotes(ob, text, i, options->quotes.in_squote)) {
				options->quotes.in_squote = !options->quotes.in_squote;
				continue;
			}
			break;
		}

		/*
		 * Copy raw character
		 */
		put_scaped_char(ob, c);
	}
}

void
ups_dom_renderer(struct mkd_renderer *renderer, unsigned int render_flags, void* user)
{
	static const struct mkd_renderer renderer_default = {
		rndr_blockcode,
		rndr_blockquote,
		rndr_raw_block,
		rndr_header,
		rndr_hrule,
		rndr_list,
		rndr_listitem,
		rndr_paragraph,
		rndr_table,
		rndr_tablerow,
		rndr_tablecell,

		rndr_autolink,
		rndr_codespan,
		rndr_double_emphasis,
		rndr_emphasis,
		rndr_image,
		rndr_linebreak,
		rndr_link,
		rndr_raw_html,
		rndr_triple_emphasis,
		rndr_strikethrough,

		NULL,
		rndr_normal_text,

		NULL,
		NULL,

		NULL
	};

	struct xhtml_renderopt *options;	
	options = calloc(1, sizeof(struct xhtml_renderopt));
	options->flags = render_flags;
    options->user = user;

	memcpy(renderer, &renderer_default, sizeof(struct mkd_renderer));
	renderer->opaque = options;

    // XXXjoe This stuff is all ignored
    // if (render_flags & XHTML_SKIP_IMAGES)
    //  renderer->image = NULL;
    // 
    // if (render_flags & XHTML_SKIP_LINKS) {
    //  renderer->link = NULL;
    //  renderer->autolink = NULL;
    // }
    // 
    // if (render_flags & XHTML_SMARTYPANTS)
    //  renderer->normal_text = rndr_smartypants;
    // 
    // if (render_flags & XHTML_GITHUB_BLOCKCODE)
    //  renderer->blockcode = rndr_blockcode_github;
	
	
}
