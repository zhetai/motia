import os
import sys
import json
import modulegraph.modulegraph

NODEIPCFD = int(os.environ["NODE_CHANNEL_FD"])

def trace_imports(entry_file):
    module_dir = os.path.dirname(os.path.abspath(entry_file))
    """Find all imported Python files starting from an entry file."""
    # Add both the module directory and current Python path to search paths
    paths = [module_dir] + sys.path
    graph = modulegraph.modulegraph.ModuleGraph(paths)
    graph.run_script(entry_file)

    files = set()
    cwd = os.getcwd()
    for mod in graph.nodes():
        if mod.filename and mod.filename.endswith(".py"):
            abs_path = os.path.abspath(mod.filename)
            if abs_path.startswith(cwd):
                rel_path = os.path.relpath(abs_path, cwd)
                files.add(rel_path)

    return list(files)

if __name__ == "__main__":
    entry_file = sys.argv[1] # Get entrypoint from CLI args
    files = trace_imports(entry_file)
    bytes_message = (json.dumps(files) + '\n').encode('utf-8')
    os.write(NODEIPCFD, bytes_message)
