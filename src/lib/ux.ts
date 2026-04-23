class TreeNode {
  nodes: Record<string, TreeNode> = {};

  insert(label: string) {
    if (!this.nodes[label]) {
      this.nodes[label] = new TreeNode();
    }
  }

  display(prefix = '', isRoot = true) {
    const keys = Object.keys(this.nodes);
    keys.forEach((key, i) => {
      if (isRoot) {
        console.log(key);
        this.nodes[key].display('', false);
      } else {
        const isLast = i === keys.length - 1;
        console.log(`${prefix}${isLast ? '└── ' : '├── '}${key}`);
        this.nodes[key].display(prefix + (isLast ? '    ' : '│   '), false);
      }
    });
  }
}

export const ux = {
  action: {
    start(msg: string) {
      process.stderr.write(`${msg}... `);
    },
    stop(msg = 'done') {
      process.stderr.write(`${msg}\n`);
    },
  },
  warn(input: any) {
    const msg = input instanceof Error ? input.message : String(input);
    console.warn(`Warning: ${msg}`);
  },
  tree() {
    return new TreeNode();
  },
};
