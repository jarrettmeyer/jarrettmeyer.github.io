import type { Root, Element } from "hast";
import type { Plugin } from "unified";

function walk(node: Root | Element, visit: (node: Element) => void): void {
  if ("children" in node) {
    for (const child of node.children) {
      if (child.type === "element") {
        visit(child);
        walk(child, visit);
      }
    }
  }
}

const externalLinkDecorator: Plugin<[], Root> = () => {
  return (tree: Root) => {
    walk(tree, (node: Element) => {
      if (node.tagName !== "a") return;

      const href = node.properties?.href;
      if (typeof href !== "string" || !href.startsWith("http")) return;

      node.properties = node.properties ?? {};
      node.properties.target = "_blank";
      node.properties.rel = "noopener noreferrer";
    });
  };
};

export default externalLinkDecorator;
