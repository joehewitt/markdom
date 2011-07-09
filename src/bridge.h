
#ifndef BRIDGE_H
#define BRIDGE_H

int markdom_handle_header(struct buf* ob, int level, struct buf* content, void *user);
int markdom_handle_paragraph(struct buf* ob, struct buf* content, void *user);
int markdom_handle_blockquote(struct buf* ob, struct buf* content, void *user);
int markdom_handle_blockCode(struct buf* ob, struct buf* lang, struct buf* content, void *user);
int markdom_handle_blockHTML(struct buf* ob, struct buf* content, void *user);
int markdom_handle_list(struct buf* ob, int ordered, struct buf* items, void *user);
int markdom_handle_listItem(struct buf* ob, struct buf* content, void *user);
int markdom_handle_table(struct buf* ob, struct buf* header, struct buf* body, void *user);
int markdom_handle_tableRow(struct buf* ob, struct buf* cells, void *user);
int markdom_handle_tableCell(struct buf* ob, struct buf* content, int align, void *user);
int markdom_handle_hrule(struct buf* ob, void *user);
int markdom_handle_lineBreak(struct buf* ob, void *user);
int markdom_handle_emphasis(struct buf* ob, int depth, struct buf *content, void *user);
int markdom_handle_strikethrough(struct buf* ob, struct buf *content, void *user);
int markdom_handle_codespan(struct buf* ob, struct buf *content, void *user);
int markdom_handle_link(struct buf* ob, struct buf *url, struct buf *title, struct buf* content,
                        void *user);
int markdom_handle_autolink(struct buf* ob, struct buf *url, int tpye, void *user);
int markdom_handle_image(struct buf* ob, struct buf *url, struct buf *title, struct buf *alt,
                         void *user);
int markdom_handle_text(struct buf* ob, struct buf *text, void *user);

#endif // BRIDGE_H
