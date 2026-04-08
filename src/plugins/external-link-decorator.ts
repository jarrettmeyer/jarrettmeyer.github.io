import type { Root, Element, Properties } from "hast";
import type { Plugin } from "unified";

const arrowUpRightSvg: Element = {
  type: "element",
  tagName: "svg",
  properties: {
    xmlns: "http://www.w3.org/2000/svg",
    width: "0.75em",
    height: "0.75em",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  } as Properties,
  children: [
    {
      type: "element",
      tagName: "path",
      properties: { d: "M7 7h10v10" } as Properties,
      children: [],
    },
    {
      type: "element",
      tagName: "path",
      properties: { d: "M7 17 17 7" } as Properties,
      children: [],
    },
  ],
};

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

      const iconSpan: Element = {
        type: "element",
        tagName: "span",
        properties: {
          className: ["external-link-icon"],
          ariaHidden: "true",
        } as Properties,
        children: [arrowUpRightSvg],
      };

      node.children.push(iconSpan);
    });
  };
};

export default externalLinkDecorator;
