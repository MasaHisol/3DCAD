// Product structure tree for the model browser: groups items (part bodies read
// from a STEP assembly, or assembly components) by their assembly path, so a
// sub-assembly can be hidden / isolated as one unit.

export interface TreeNode<T> {
  /** Unique key (joined path). */
  key: string;
  name: string;
  depth: number;
  children: TreeNode<T>[];
  /** Items directly under this node. */
  items: T[];
}

/**
 * Builds the tree from item paths. `path` lists the assembly levels from the
 * root down to the node that holds the item (e.g. [root, sub-assembly, instance]
 * for a body of a STEP instance). Items without a path stay at the top (`loose`).
 */
export function buildTree<T>(entries: { item: T; path?: string[] }[]): { roots: TreeNode<T>[]; loose: T[] } {
  const roots: TreeNode<T>[] = [];
  const loose: T[] = [];
  const byKey = new Map<string, TreeNode<T>>();
  for (const e of entries) {
    const path = e.path;
    if (!path?.length) {
      loose.push(e.item);
      continue;
    }
    let level = roots;
    let node: TreeNode<T> | undefined;
    path.forEach((name, d) => {
      const key = path.slice(0, d + 1).join("\u0001");
      node = byKey.get(key);
      if (!node) {
        node = { key, name: name || "(名前なし)", depth: d, children: [], items: [] };
        byKey.set(key, node);
        level.push(node);
      }
      level = node.children;
    });
    node!.items.push(e.item);
  }
  return { roots, loose };
}

/** Every item of a node and its descendants. */
export function nodeItems<T>(n: TreeNode<T>): T[] {
  return [...n.items, ...n.children.flatMap(nodeItems)];
}

/** Nodes whose own name or any descendant item matches the filter (browser search). */
export function filterTree<T>(nodes: TreeNode<T>[], match: (item: T) => boolean, q: string): TreeNode<T>[] {
  if (!q) return nodes;
  const ql = q.toLowerCase();
  const rec = (n: TreeNode<T>): TreeNode<T> | null => {
    if (n.name.toLowerCase().includes(ql)) return n;
    const children = n.children.map(rec).filter((x): x is TreeNode<T> => !!x);
    const items = n.items.filter(match);
    return children.length || items.length ? { ...n, children, items } : null;
  };
  return nodes.map(rec).filter((x): x is TreeNode<T> => !!x);
}
