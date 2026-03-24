/**
 * Rehype plugin that converts Markdown thematic breaks (---) into Reveal.js
 * slide boundaries for MDX presentation files.
 *
 * Only applies to files under /pages/present/. Splits the document by <hr>
 * elements and wraps each group of nodes in a <section> tag. MDX ES module
 * nodes (imports/exports) are hoisted above the sections so they remain
 * accessible to the compiled module.
 */
export function rehypeRevealSlides() {
  return (tree: any, file: any) => {
    if (!file.path?.includes("/pages/present/")) return;

    const hoisted: any[] = [];
    const content: any[] = [];

    for (const node of tree.children) {
      if (node.type === "mdxjsEsm") {
        hoisted.push(node);
      } else {
        content.push(node);
      }
    }

    const groups: any[][] = [];
    let current: any[] = [];

    for (const node of content) {
      if (node.type === "element" && node.tagName === "hr") {
        groups.push(current);
        current = [];
      } else {
        current.push(node);
      }
    }
    groups.push(current);

    const isNonEmpty = (group: any[]) =>
      group.some((n) => n.type !== "text" || n.value.trim() !== "");

    const sections = groups.filter(isNonEmpty).map((group) => ({
      type: "element",
      tagName: "section",
      properties: {},
      children: group,
    }));

    tree.children = [...hoisted, ...sections];
  };
}
