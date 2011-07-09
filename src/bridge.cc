
#include <v8.h>
#include <node.h>

extern "C" {
    #include <stdio.h>
    #include "markdown.h"
    #include "bridge.h"
}

using namespace v8;

// *************************************************************************************************

int callNodeConstructor(Handle<Function>& fn, Handle<Object>& handler, int argCount,
                         Handle<Value>* fnArgs, struct buf* ob) {
    TryCatch trycatch;

    Handle<Value> ret = fn->Call(handler, argCount, fnArgs);

    if (ret.IsEmpty()) {  
      Handle<Value> exception = trycatch.Exception();
      String::AsciiValue exception_str(exception);
      printf("Exception: %s\n", *exception_str); fflush(stdout);
      return 0;
    }


    Handle<String> ids = ret->ToString();
    
    char* buf = new char[ids->Utf8Length()];
    ids->WriteUtf8(buf);
    bufput(ob, buf, ids->Length());
    bufputc(ob, ',');
    // printf("returned %d %s\n", ob->size, ob->data); fflush(stdout);
    delete buf;

    return 1;
}

// *************************************************************************************************

extern "C" int
markdom_handle_header(struct buf* ob, int level, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("header");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<Number> _level = Number::New(level);
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_level, _content};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_paragraph(struct buf* ob, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("paragraph");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_blockquote(struct buf* ob, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("blockquote");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_blockHTML(struct buf* ob, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("blockHTML");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_blockCode(struct buf* ob, struct buf* lang, struct buf* text, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("blockCode");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _lang = String::New(lang ? lang->data: "", lang ? lang->size : 0);
        Handle<String> _text = String::New(text ? text->data: "", text ? text->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_lang, _text};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_list(struct buf* ob, int ordered, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("list");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<Number> _ordered = Number::New(ordered);
        Handle<String> _content = String::New(
                                    content ? content->data : "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_ordered, _content};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_listItem(struct buf* ob, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("listItem");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_table(struct buf* ob, struct buf* header, struct buf* body, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("table");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _header = String::New(
                                    header ? header->data: "", header ? header->size : 0);
        Handle<String> _body = String::New(
                                    body ? body->data: "", body ? body->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_header, _body};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_tableRow(struct buf* ob, struct buf* cells, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("tableRow");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _cells = String::New(
                                    cells ? cells->data: "", cells ? cells->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_cells};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_tableCell(struct buf* ob, struct buf* content, int align, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("tableCell");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);
        Handle<Number> _align = Number::New(align);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content, _align};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_hrule(struct buf* ob, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("hrule");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<Function> fn = Handle<Function>::Cast(fnV);
        return callNodeConstructor(fn, handler, 0, 0, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_lineBreak(struct buf* ob, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("lineBreak");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<Function> fn = Handle<Function>::Cast(fnV);
        return callNodeConstructor(fn, handler, 0, 0, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_emphasis(struct buf* ob, int depth, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("emphasis");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<Number> _depth = Number::New(depth);
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_depth, _content};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_strikethrough(struct buf* ob, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("strikethrough");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_content};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_codespan(struct buf* ob, struct buf* text, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("codeSpan");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _text = String::New(text ? text->data: "", text ? text->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_text};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_link(struct buf* ob, struct buf *url, struct buf* title, struct buf* content, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("link");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _url = String::New(url ? url->data: "", url ? url->size : 0);
        Handle<String> _title = String::New(title ? title->data: "", title ? title->size : 0);
        Handle<String> _content = String::New(
                                    content ? content->data: "", content ? content->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_url, _title, _content};
        return callNodeConstructor(fn, handler, 3, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_autolink(struct buf* ob, struct buf *url, int type, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("autolink");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _url = String::New(url ? url->data: "", url ? url->size : 0);
        Handle<Number> _type = Number::New(type);
        
        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_url, _type};
        return callNodeConstructor(fn, handler, 2, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_image(struct buf* ob, struct buf *url, struct buf *title, struct buf *alt, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("image");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _url = String::New(url ? url->data: "", url ? url->size : 0);
        Handle<String> _title = String::New(title ? title->data : "", title ? title->size : 0);
        Handle<String> _alt = String::New(alt ? alt->data : "", alt ? alt->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_url, _title, _alt};
        return callNodeConstructor(fn, handler, 3, fnArgs, ob);
    }
    return 1;
}

extern "C" int
markdom_handle_text(struct buf* ob, struct buf *text, void *user) {
    Handle<Object> handler = Handle<Object>::Cast(*(Handle<Value>*)user);
    Handle<String> fnName = String::New("text");
    Handle<Value> fnV = handler->Get(fnName);
    if (fnV->IsFunction()) {
        Handle<String> _text = String::New(text ? text->data: "", text ? text->size : 0);

        Handle<Function> fn = Handle<Function>::Cast(fnV);
        Handle<Value> fnArgs[] = {_text};
        return callNodeConstructor(fn, handler, 1, fnArgs, ob);
    }
    return 1;
}
