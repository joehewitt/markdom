#include <v8.h>
#include <node.h>

extern "C" {
    #include "markdown.h"
    #include "xhtml.h"
    #include "dom.h"
    #include "bridge.h"
}

#define READ_UNIT 1024
#define OUTPUT_UNIT 64

using namespace v8;  
 
static Handle<Value> ToHTML(const Arguments& args) {
    HandleScope scope;

    if (args.Length() < 1) {
        return ThrowException(Exception::TypeError(String::New("Source argument missing")));
    }

    String::Utf8Value in(args[0]);

    struct mkd_renderer renderer;

    struct buf* ob = bufnew(OUTPUT_UNIT);
    struct buf* ib = bufnew(READ_UNIT);
    bufputs(ib, (char*)*in);

    size_t iterations = 1;
    for (size_t i = 0; i < iterations; ++i) {
        ob->size = 0;

        ups_xhtml_renderer(&renderer, 0);
        ups_markdown(ob, ib, &renderer, 0xFF);
        ups_free_renderer(&renderer);
    }

    Handle<String> ret = String::New(ob->data, ob->size);
    
    bufrelease(ib);
    bufrelease(ob);
    
    return scope.Close(ret);
}
 
static Handle<Value> ToDOM(const Arguments& args) {
    HandleScope scope;

    if (args.Length() < 2) {
        return ThrowException(Exception::TypeError(String::New("Handler argument missing")));
    }
    if (args.Length() < 1) {
        return ThrowException(Exception::TypeError(String::New("Source argument missing")));
    }

    String::Utf8Value in(args[0]);
    Handle<Value> handler = args[1];
    int options = 0xFF;

    if (args.Length() > 2) {
        Handle<String> disableEmphasis = String::New("disableEmphasis");
        Handle<String> disableTable = String::New("disableTables");
        Handle<String> disableFencedCode = String::New("disableFencedCode");
        Handle<String> disableAutolink = String::New("disableAutolink");
        Handle<String> disableStrikethrough = String::New("disableStrikethrough");
        Handle<String> disableHTML = String::New("disableHTML");
        
        Handle<Object> optionMap = Handle<Object>::Cast(args[2]);
        if (optionMap->Get(disableEmphasis)->IsTrue()) {
            options &= ~MKDEXT_LAX_EMPHASIS;
        }
        if (optionMap->Get(disableTable)->IsTrue()) {
            options &= ~MKDEXT_TABLES;
        }
        if (optionMap->Get(disableFencedCode)->IsTrue()) {
            options &= ~MKDEXT_FENCED_CODE;
        }
        if (optionMap->Get(disableAutolink)->IsTrue()) {
            options &= ~MKDEXT_AUTOLINK;
        }
        if (optionMap->Get(disableStrikethrough)->IsTrue()) {
            options &= ~MKDEXT_STRIKETHROUGH;
        }
        if (optionMap->Get(disableHTML)->IsTrue()) {
            options &= ~MKDEXT_LAX_HTML_BLOCKS;
        }
    }
    
    struct buf  *ib, *ob;
    struct mkd_renderer renderer;
    size_t i, iterations = 1;

    /* performing markdown parsing */
    ob = bufnew(OUTPUT_UNIT);
    ib = bufnew(READ_UNIT);
    bufputs(ib, (char*)*in);

    for (i = 0; i < iterations; ++i) {
        ob->size = 0;

        ups_dom_renderer(&renderer, 0, &handler);
        ups_markdown(ob, ib, &renderer, options);
        ups_free_renderer(&renderer);
    }

    Handle<String> ret = String::New(ob->data, ob->size);
    
    bufrelease(ib);
    bufrelease(ob);
    
    return scope.Close(ret);
}
 
extern "C" void
init (Handle<Object> target) {
    HandleScope scope;
    target->Set(String::New("version"), String::New("0.1"));
    NODE_SET_METHOD(target, "toHTML", ToHTML);
    NODE_SET_METHOD(target, "toDOM", ToDOM);
}
