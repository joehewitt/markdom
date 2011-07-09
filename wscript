
srcdir = '.'
# import sys
# blddir = 'build/%s' % sys.platform
blddir = 'build'
VERSION = '0.0.1'
 
def set_options(opt):
    opt.tool_options("compiler_cc")
    opt.tool_options('compiler_cxx')
 
def configure(conf):
    conf.check_tool("compiler_cc")
    conf.check_tool("compiler_cxx")
    conf.check_tool("node_addon")
    #conf.env.append_value('CCFLAGS', ['-fstack-protector', '-O', '-g', '-march=native'])
    conf.env.append_value('CCFLAGS', ['-O3'])
 
def build(bld):
    obj = bld.new_task_gen('cxx', 'shlib', 'node_addon', 'cc')
    obj.target = '_markdom'
    obj.source = """
        src/markdown.c
        src/array.c
        src/buffer.c
        src/xhtml.c
        src/dom.c
        src/bridge.cc
        src/markdom.cc"""
