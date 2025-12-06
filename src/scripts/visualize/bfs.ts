interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
}

interface BFSStep {
  type: "enqueue" | "dequeue" | "visit";
  nodeValue: number;
  queue: number[];
  visitedNodes: Set<number>;
  visitOrder: Map<number, number>;
  currentLevel: number;
  levelNodes: Set<number>;
  pathToTarget: number[];
}

enum Color {
  Blue = "#0d6efd",
  Yellow = "#ffc107",
  Green = "#28a745",
  Red = "#dc3545",
  Purple = "#6f42c1",
  Orange = "#fd7e14",
  White = "#fff",
  LightGray = "#999",
  DarkGray = "#666",
}

export class BFSVisualizer {
  // Tree structure
  private root: TreeNode | null = null;
  private allNodes: TreeNode[] = [];

  // BFS state
  private startNodeValue: number | null = null;
  private targetNodeValue: number | null = null;
  private targetFoundAtStep: number = -1;
  private targetNotFound: boolean = false;
  private pathToTarget: number[] = [];
  private bfsSteps: BFSStep[] = [];
  private currentStepIndex: number = -1;

  // Animation
  private isAnimating: boolean = false;
  private animationSpeed: number = 500;
  private speedMultiplier: number = 1;

  // Constants
  private readonly TREE_SIZE = 15;
  private readonly MAX_DEPTH = 5;
  private readonly NODE_RADIUS = 25;
  private readonly VERTICAL_SPACING = 80;

  // Calculate minimum horizontal spacing based on node size
  // Node diameter (50px) + minimum gap (30px) = 80px
  private get MIN_HORIZONTAL_SPACING(): number {
    return this.NODE_RADIUS * 2 + 30;
  }

  // DOM elements
  private treeSvg: SVGSVGElement;
  private queueSvg: SVGSVGElement;
  private generateBtn: HTMLButtonElement;
  private statusList: HTMLOListElement;
  private playBtn: HTMLButtonElement;
  private pauseBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private speedSelect: HTMLSelectElement;
  private progressStat: HTMLElement;
  private levelStat: HTMLElement;
  private visitedStat: HTMLElement;
  private queueSizeStat: HTMLElement;

  constructor() {
    // Initialize DOM references
    const treeSvg = document.getElementById("treeSvg") as SVGSVGElement | null;
    const queueSvg = document.getElementById(
      "queueSvg"
    ) as SVGSVGElement | null;
    const generateBtn = document.getElementById(
      "generateBtn"
    ) as HTMLButtonElement | null;
    const statusList = document.getElementById(
      "statusList"
    ) as HTMLOListElement | null;
    const playBtn = document.getElementById(
      "playBtn"
    ) as HTMLButtonElement | null;
    const pauseBtn = document.getElementById(
      "pauseBtn"
    ) as HTMLButtonElement | null;
    const resetBtn = document.getElementById(
      "resetBtn"
    ) as HTMLButtonElement | null;
    const speedSelect = document.getElementById(
      "speedSelect"
    ) as HTMLSelectElement | null;
    const progressStat = document.getElementById(
      "progressStat"
    ) as HTMLElement | null;
    const levelStat = document.getElementById(
      "levelStat"
    ) as HTMLElement | null;
    const visitedStat = document.getElementById(
      "visitedStat"
    ) as HTMLElement | null;
    const queueSizeStat = document.getElementById(
      "queueSizeStat"
    ) as HTMLElement | null;

    if (
      !treeSvg ||
      !queueSvg ||
      !generateBtn ||
      !statusList ||
      !playBtn ||
      !pauseBtn ||
      !resetBtn ||
      !speedSelect ||
      !progressStat ||
      !levelStat ||
      !visitedStat ||
      !queueSizeStat
    ) {
      throw new Error("Required elements not found in the DOM");
    }

    this.treeSvg = treeSvg;
    this.queueSvg = queueSvg;
    this.generateBtn = generateBtn;
    this.statusList = statusList;
    this.playBtn = playBtn;
    this.pauseBtn = pauseBtn;
    this.resetBtn = resetBtn;
    this.speedSelect = speedSelect;
    this.progressStat = progressStat;
    this.levelStat = levelStat;
    this.visitedStat = visitedStat;
    this.queueSizeStat = queueSizeStat;

    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    this.generateBtn.addEventListener("click", () => this.handleGenerate());
    this.playBtn.addEventListener("click", () => void this.handlePlay());
    this.pauseBtn.addEventListener("click", () => this.handlePause());
    this.resetBtn.addEventListener("click", () => this.handleReset());
    this.speedSelect.addEventListener("change", () => this.handleSpeedChange());
  }

  private handleGenerate(): void {
    if (this.isAnimating) return;

    this.generateTree(this.TREE_SIZE);
    this.startNodeValue = null;
    this.targetNodeValue = null;
    this.targetFoundAtStep = -1;
    this.bfsSteps = [];
    this.currentStepIndex = -1;
    this.updateStatusBadge();
    this.render();
  }

  private generateTree(targetSize: number): void {
    // Track used values to ensure uniqueness
    const usedValues = new Set<number>();

    // Level-order construction - track level with each node
    const rootValue = this.getUniqueRandomValue(usedValues);
    this.root = { value: rootValue, left: null, right: null };
    const queue: Array<{ node: TreeNode; level: number }> = [
      { node: this.root, level: 0 },
    ];
    let currentSize = 1;

    while (queue.length > 0 && currentSize < targetSize) {
      const { node, level } = queue.shift()!;

      // Don't add children if they would exceed max depth
      // MAX_DEPTH = 5 means we want depths 0-4 only (5 levels total)
      // So we stop adding children when parent is at level MAX_DEPTH - 1 (level 4)
      if (level >= this.MAX_DEPTH - 1) {
        continue;
      }

      // Probability decreases with level to create semi-balanced trees
      const probability = 0.85 * Math.pow(0.75, level);

      // Randomly decide to add children, but ensure we keep trying to reach target size
      const shouldAddLeft =
        Math.random() < probability || currentSize < targetSize / 2;
      const shouldAddRight =
        Math.random() < probability || currentSize < targetSize / 2;

      // Try to add left child
      if (currentSize < targetSize && shouldAddLeft && !node.left) {
        const leftValue = this.getUniqueRandomValue(usedValues);
        node.left = { value: leftValue, left: null, right: null };
        queue.push({ node: node.left, level: level + 1 });
        currentSize++;
      }

      // Try to add right child
      if (currentSize < targetSize && shouldAddRight && !node.right) {
        const rightValue = this.getUniqueRandomValue(usedValues);
        node.right = { value: rightValue, left: null, right: null };
        queue.push({ node: node.right, level: level + 1 });
        currentSize++;
      }
    }

    this.allNodes = this.flattenTree(this.root);
    this.calculateNodePositions();
  }

  private getUniqueRandomValue(usedValues: Set<number>): number {
    let value: number;
    let attempts = 0;
    const maxAttempts = 1000; // Safety limit to prevent infinite loop

    do {
      value = this.randomInt(1, 99);
      attempts++;

      if (attempts > maxAttempts) {
        // Fallback: find first unused value
        for (let i = 1; i <= 99; i++) {
          if (!usedValues.has(i)) {
            value = i;
            break;
          }
        }
        break;
      }
    } while (usedValues.has(value));

    usedValues.add(value);
    return value;
  }

  private calculateNodePositions(): void {
    if (!this.root) return;

    // First pass: calculate relative positions and subtree widths
    this.calculateSubtreeWidths(this.root);

    // Second pass: assign absolute positions
    const svgWidth = this.treeSvg.clientWidth;
    const startX = svgWidth / 2;
    const startY = 40;

    this.assignAbsolutePositions(this.root, startX, startY, 0);
  }

  private calculateSubtreeWidths(node: TreeNode | null): number {
    if (!node) return 0;

    const leftWidth = this.calculateSubtreeWidths(node.left);
    const rightWidth = this.calculateSubtreeWidths(node.right);

    // If leaf node, width is minimum spacing
    if (!node.left && !node.right) {
      return this.MIN_HORIZONTAL_SPACING;
    }

    // Width is sum of children's widths
    // Add extra spacing between left and right subtrees to prevent overlap
    const spacing = this.MIN_HORIZONTAL_SPACING;
    const totalWidth = leftWidth + rightWidth + spacing;

    // Store the relative offset for this node (centered between children)
    // Position is center of allocated space for each subtree
    const leftOffset = (leftWidth + spacing / 2) / 2;
    const rightOffset = (rightWidth + spacing / 2) / 2;

    // Store these for later use
    (node as any).leftOffset = leftOffset;
    (node as any).rightOffset = rightOffset;
    (node as any).subtreeWidth = Math.max(
      totalWidth,
      this.MIN_HORIZONTAL_SPACING
    );

    return (node as any).subtreeWidth;
  }

  private assignAbsolutePositions(
    node: TreeNode | null,
    x: number,
    y: number,
    level: number
  ): void {
    if (!node) return;

    node.x = x;
    node.y = y;

    const childY = y + this.VERTICAL_SPACING;

    if (node.left || node.right) {
      const leftWidth = node.left ? this.getNodeSubtreeWidth(node.left) : 0;
      const rightWidth = node.right ? this.getNodeSubtreeWidth(node.right) : 0;
      const spacing = this.MIN_HORIZONTAL_SPACING;

      if (node.left && node.right) {
        // Both children exist
        const leftChildX = x - (rightWidth + spacing) / 2;
        const rightChildX = x + (leftWidth + spacing) / 2;

        this.assignAbsolutePositions(node.left, leftChildX, childY, level + 1);
        this.assignAbsolutePositions(
          node.right,
          rightChildX,
          childY,
          level + 1
        );
      } else if (node.left) {
        // Only left child
        this.assignAbsolutePositions(
          node.left,
          x - spacing / 2,
          childY,
          level + 1
        );
      } else if (node.right) {
        // Only right child
        this.assignAbsolutePositions(
          node.right,
          x + spacing / 2,
          childY,
          level + 1
        );
      }
    }
  }

  private getNodeSubtreeWidth(node: TreeNode | null): number {
    if (!node) return 0;
    return (node as any).subtreeWidth || this.MIN_HORIZONTAL_SPACING;
  }

  private flattenTree(node: TreeNode | null): TreeNode[] {
    if (!node) return [];
    const result: TreeNode[] = [];
    const queue: TreeNode[] = [node];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      if (current.left) queue.push(current.left);
      if (current.right) queue.push(current.right);
    }

    return result;
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private handleNodeClick(value: number): void {
    if (this.isAnimating || !this.root) return;

    // If no start node, set this as start
    if (this.startNodeValue === null) {
      this.startNodeValue = value;
      this.currentStepIndex = -1;
      this.bfsSteps = [];
      this.targetFoundAtStep = -1;
      this.updateStatusBadge();
      this.render();
      return;
    }

    // If start is set but no target, set this as target
    if (this.targetNodeValue === null) {
      // Can't select the same node as both start and target
      if (value === this.startNodeValue) {
        return;
      }

      this.targetNodeValue = value;
      this.currentStepIndex = -1;
      this.targetFoundAtStep = -1;
      this.targetNotFound = false;
      this.pathToTarget = [];
      this.bfsSteps = this.computeBFSSteps(
        this.root,
        this.startNodeValue,
        this.targetNodeValue
      );
      this.updateStatusBadge();
      this.render();
      return;
    }

    // If both are set, clicking resets to new start
    this.startNodeValue = value;
    this.targetNodeValue = null;
    this.targetFoundAtStep = -1;
    this.targetNotFound = false;
    this.pathToTarget = [];
    this.currentStepIndex = -1;
    this.bfsSteps = [];
    this.updateStatusBadge();
    this.render();
  }

  private computeBFSSteps(
    root: TreeNode,
    startValue: number,
    targetValue: number
  ): BFSStep[] {
    const steps: BFSStep[] = [];
    const startNode = this.findNodeByValue(root, startValue);
    if (!startNode) return steps;

    const queue: TreeNode[] = [startNode];
    const visited = new Set<number>();
    const visitOrder = new Map<number, number>();
    const parent = new Map<number, number>(); // Track parent for path reconstruction
    let visitCount = 0;
    let targetFound = false;

    // Track levels for each node
    const nodeLevels = new Map<number, number>();
    nodeLevels.set(startValue, 0);

    // Initial enqueue
    steps.push({
      type: "enqueue",
      nodeValue: startValue,
      queue: [startValue],
      visitedNodes: new Set(visited),
      visitOrder: new Map(visitOrder),
      currentLevel: 0,
      levelNodes: new Set([startValue]),
      pathToTarget: [],
    });

    while (queue.length > 0 && !targetFound) {
      const currentNode = queue.shift()!;
      const currentLevel = nodeLevels.get(currentNode.value) || 0;

      // Get all nodes at current level
      const levelNodes = new Set<number>();
      for (const [nodeValue, level] of nodeLevels.entries()) {
        if (level === currentLevel) {
          levelNodes.add(nodeValue);
        }
      }

      // Dequeue step
      steps.push({
        type: "dequeue",
        nodeValue: currentNode.value,
        queue: queue.map((n) => n.value),
        visitedNodes: new Set(visited),
        visitOrder: new Map(visitOrder),
        currentLevel,
        levelNodes,
        pathToTarget: [],
      });

      // Visit step
      visited.add(currentNode.value);
      visitCount++;
      visitOrder.set(currentNode.value, visitCount);

      // Check if we found the target
      if (currentNode.value === targetValue) {
        targetFound = true;
        this.targetFoundAtStep = steps.length;

        // Reconstruct path from start to target
        const path: number[] = [];
        let current = targetValue;
        while (current !== undefined) {
          path.unshift(current);
          current = parent.get(current)!;
        }
        this.pathToTarget = path;

        steps.push({
          type: "visit",
          nodeValue: currentNode.value,
          queue: queue.map((n) => n.value),
          visitedNodes: new Set(visited),
          visitOrder: new Map(visitOrder),
          currentLevel,
          levelNodes,
          pathToTarget: path,
        });
        break;
      }

      steps.push({
        type: "visit",
        nodeValue: currentNode.value,
        queue: queue.map((n) => n.value),
        visitedNodes: new Set(visited),
        visitOrder: new Map(visitOrder),
        currentLevel,
        levelNodes,
        pathToTarget: [],
      });

      // Enqueue children
      if (currentNode.left && !visited.has(currentNode.left.value)) {
        queue.push(currentNode.left);
        nodeLevels.set(currentNode.left.value, currentLevel + 1);
        parent.set(currentNode.left.value, currentNode.value); // Track parent

        steps.push({
          type: "enqueue",
          nodeValue: currentNode.left.value,
          queue: queue.map((n) => n.value),
          visitedNodes: new Set(visited),
          visitOrder: new Map(visitOrder),
          currentLevel,
          levelNodes,
          pathToTarget: [],
        });
      }

      if (currentNode.right && !visited.has(currentNode.right.value)) {
        queue.push(currentNode.right);
        nodeLevels.set(currentNode.right.value, currentLevel + 1);
        parent.set(currentNode.right.value, currentNode.value); // Track parent

        steps.push({
          type: "enqueue",
          nodeValue: currentNode.right.value,
          queue: queue.map((n) => n.value),
          visitedNodes: new Set(visited),
          visitOrder: new Map(visitOrder),
          currentLevel,
          levelNodes,
          pathToTarget: [],
        });
      }
    }

    // If target not found, mark it
    if (!targetFound) {
      this.targetNotFound = true;
      this.targetFoundAtStep = -1;
    }

    return steps;
  }

  private findNodeByValue(
    node: TreeNode | null,
    value: number
  ): TreeNode | null {
    if (!node) return null;
    if (node.value === value) return node;

    const leftResult = this.findNodeByValue(node.left, value);
    if (leftResult) return leftResult;

    return this.findNodeByValue(node.right, value);
  }

  private async handlePlay(): Promise<void> {
    if (this.isAnimating || !this.startNodeValue || this.bfsSteps.length === 0)
      return;
    if (this.currentStepIndex >= this.bfsSteps.length - 1) return;

    this.isAnimating = true;
    this.updateButtonStates();

    while (
      this.currentStepIndex < this.bfsSteps.length - 1 &&
      this.isAnimating
    ) {
      await this.handleNext();
      if (this.isAnimating) {
        await this.delay(this.animationSpeed / this.speedMultiplier);
      }
    }

    this.isAnimating = false;
    this.updateButtonStates();
  }

  private handlePause(): void {
    this.isAnimating = false;
    this.updateButtonStates();
  }

  private async handleNext(): Promise<void> {
    if (this.isAnimating && this.currentStepIndex >= this.bfsSteps.length - 1) {
      this.isAnimating = false;
      this.updateButtonStates();
      return;
    }

    if (this.currentStepIndex >= this.bfsSteps.length - 1) return;

    this.currentStepIndex++;
    const step = this.bfsSteps[this.currentStepIndex];

    await this.animateStep(step);
    this.render();
  }

  private handleReset(): void {
    if (this.isAnimating) return;

    // Reset all BFS state
    this.startNodeValue = null;
    this.targetNodeValue = null;
    this.targetFoundAtStep = -1;
    this.targetNotFound = false;
    this.pathToTarget = [];
    this.bfsSteps = [];
    this.currentStepIndex = -1;

    this.updateStatusBadge();
    this.render();
  }

  private handleSpeedChange(): void {
    this.speedMultiplier = parseFloat(this.speedSelect.value);
  }

  private async animateStep(step: BFSStep): Promise<void> {
    const duration = this.animationSpeed / this.speedMultiplier;

    switch (step.type) {
      case "dequeue":
        // Yellow highlight on queue front
        await this.delay(duration * 0.3);
        break;

      case "visit":
        // Yellow to blue transition on tree node
        await this.delay(duration * 0.5);
        break;

      case "enqueue":
        // Yellow outline flash on tree node
        await this.delay(duration * 0.2);
        break;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private render(): void {
    this.renderTree();
    this.renderQueue();
    this.renderStats();
    this.updateStatusBadge();
    this.updateButtonStates();
  }

  private renderTree(): void {
    this.treeSvg.innerHTML = "";

    if (!this.root) {
      const text = this.createSVGElement("text", {
        x: "50%",
        y: "50%",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: Color.LightGray,
        "font-size": "16",
      });
      text.textContent = "Click 'Generate New Tree' to start";
      this.treeSvg.appendChild(text);
      return;
    }

    // Get current step state
    const currentStep =
      this.currentStepIndex >= 0 ? this.bfsSteps[this.currentStepIndex] : null;
    const visitedNodes = currentStep?.visitedNodes || new Set<number>();
    const visitOrder = currentStep?.visitOrder || new Map<number, number>();
    const levelNodes = currentStep?.levelNodes || new Set<number>();
    const activeNode = currentStep?.nodeValue;
    const pathToTarget = currentStep?.pathToTarget || [];

    // Draw edges first (with path highlighting)
    this.drawEdges(this.root, new Set(pathToTarget));

    // Draw nodes
    for (const node of this.allNodes) {
      if (node.x === undefined || node.y === undefined) continue;

      const isStart = node.value === this.startNodeValue;
      const isTarget = node.value === this.targetNodeValue;
      const isVisited = visitedNodes.has(node.value);
      const isActive = node.value === activeNode;
      const isInLevel = levelNodes.has(node.value);
      const isInPath = pathToTarget.includes(node.value);
      const targetFound =
        this.targetFoundAtStep !== -1 &&
        this.currentStepIndex >= this.targetFoundAtStep;
      const searchComplete = this.currentStepIndex >= this.bfsSteps.length - 1;
      const targetNotReachable = isTarget && this.targetNotFound && searchComplete;

      // Determine fill color
      let fillColor = Color.DarkGray; // Unvisited
      if (isVisited) {
        fillColor = Color.Blue; // Visited
      }
      if (isInPath && targetFound) {
        fillColor = Color.Green; // Part of path to target
      }
      if (isTarget && targetFound) {
        fillColor = Color.Green; // Target found - always green when found
      }
      if (targetNotReachable) {
        fillColor = Color.Red; // Target not found - red fill
      }
      if (isActive && currentStep?.type === "visit" && !targetFound) {
        fillColor = Color.Yellow; // Currently visiting (but not if we just found target)
      }
      if (isStart && !isVisited) {
        fillColor = Color.Purple; // Start node before visiting
      }

      // Determine stroke color and width
      let strokeColor = Color.White;
      let strokeWidth = "2";

      if (isInLevel && isVisited) {
        strokeColor = Color.Orange;
        strokeWidth = "3";
      } else if (targetNotReachable) {
        strokeColor = Color.Red;
        strokeWidth = "3";
      } else if (isTarget && !isVisited) {
        strokeColor = Color.Red;
        strokeWidth = "3";
      }

      // Draw circle
      const circle = this.createSVGElement("circle", {
        cx: node.x.toString(),
        cy: node.y.toString(),
        r: "25",
        fill: fillColor,
        stroke: strokeColor,
        "stroke-width": strokeWidth,
        class: "tree-node",
      });

      if (isInLevel && isVisited) {
        circle.classList.add("level-highlight");
      }

      circle.addEventListener("click", () => this.handleNodeClick(node.value));
      this.treeSvg.appendChild(circle);

      // Draw node value
      const text = this.createSVGElement("text", {
        x: node.x.toString(),
        y: (node.y - 5).toString(),
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: Color.White,
        "font-size": "16",
        "font-weight": "bold",
      });
      text.textContent = node.value.toString();
      this.treeSvg.appendChild(text);

      // Draw visit order number
      if (visitOrder.has(node.value)) {
        const orderText = this.createSVGElement("text", {
          x: node.x.toString(),
          y: (node.y + 8).toString(),
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          fill: Color.White,
          "font-size": "10",
        });
        orderText.textContent = visitOrder.get(node.value)!.toString();
        this.treeSvg.appendChild(orderText);
      }
    }
  }

  private drawEdges(node: TreeNode | null, pathNodes: Set<number>): void {
    if (!node) return;

    const isNodeInPath = pathNodes.has(node.value);

    if (
      node.left &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.left.x !== undefined &&
      node.left.y !== undefined
    ) {
      const isEdgeInPath = isNodeInPath && pathNodes.has(node.left.value);
      const line = this.createSVGElement("line", {
        x1: node.x.toString(),
        y1: node.y.toString(),
        x2: node.left.x.toString(),
        y2: node.left.y.toString(),
        stroke: isEdgeInPath ? Color.Green : Color.DarkGray,
        "stroke-width": isEdgeInPath ? "4" : "2",
      });
      this.treeSvg.appendChild(line);
      this.drawEdges(node.left, pathNodes);
    }

    if (
      node.right &&
      node.x !== undefined &&
      node.y !== undefined &&
      node.right.x !== undefined &&
      node.right.y !== undefined
    ) {
      const isEdgeInPath = isNodeInPath && pathNodes.has(node.right.value);
      const line = this.createSVGElement("line", {
        x1: node.x.toString(),
        y1: node.y.toString(),
        x2: node.right.x.toString(),
        y2: node.right.y.toString(),
        stroke: isEdgeInPath ? Color.Green : Color.DarkGray,
        "stroke-width": isEdgeInPath ? "4" : "2",
      });
      this.treeSvg.appendChild(line);
      this.drawEdges(node.right, pathNodes);
    }
  }

  private renderQueue(): void {
    this.queueSvg.innerHTML = "";

    const currentStep =
      this.currentStepIndex >= 0 ? this.bfsSteps[this.currentStepIndex] : null;
    const queue = currentStep?.queue || [];

    if (queue.length === 0) {
      const text = this.createSVGElement("text", {
        x: "50%",
        y: "50%",
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: Color.LightGray,
        "font-size": "16",
      });
      text.textContent = "Queue is empty";
      this.queueSvg.appendChild(text);
      return;
    }

    // Draw queue boxes from left to right: [front] ... [back]
    const svgWidth = this.queueSvg.clientWidth;
    const boxWidth = 60;
    const boxHeight = 60;
    const spacing = 20;
    const totalWidth = queue.length * boxWidth + (queue.length - 1) * spacing;
    const startX = (svgWidth - totalWidth) / 2;
    const startY = 30;

    // Add "Front" and "Back" labels
    const frontLabel = this.createSVGElement("text", {
      x: (startX - 40).toString(),
      y: (startY + boxHeight / 2).toString(),
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      fill: Color.LightGray,
      "font-size": "12",
    });
    frontLabel.textContent = "Front →";
    this.queueSvg.appendChild(frontLabel);

    const backLabel = this.createSVGElement("text", {
      x: (startX + totalWidth + 40).toString(),
      y: (startY + boxHeight / 2).toString(),
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      fill: Color.LightGray,
      "font-size": "12",
    });
    backLabel.textContent = "← Back";
    this.queueSvg.appendChild(backLabel);

    // Draw queue boxes
    for (let i = 0; i < queue.length; i++) {
      const x = startX + i * (boxWidth + spacing);
      const isActive = i === 0 && currentStep?.type === "dequeue";

      const rect = this.createSVGElement("rect", {
        x: x.toString(),
        y: startY.toString(),
        width: boxWidth.toString(),
        height: boxHeight.toString(),
        fill: isActive ? Color.Yellow : Color.Green,
        stroke: Color.White,
        "stroke-width": "2",
        rx: "5",
        class: "queue-box",
      });
      this.queueSvg.appendChild(rect);

      const text = this.createSVGElement("text", {
        x: (x + boxWidth / 2).toString(),
        y: (startY + boxHeight / 2).toString(),
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        fill: Color.White,
        "font-size": "18",
        "font-weight": "bold",
      });
      text.textContent = queue[i].toString();
      this.queueSvg.appendChild(text);
    }
  }

  private renderStats(): void {
    const currentStep =
      this.currentStepIndex >= 0 ? this.bfsSteps[this.currentStepIndex] : null;

    if (!currentStep) {
      this.progressStat.textContent = "-";
      this.levelStat.textContent = "-";
      this.visitedStat.textContent = "-";
      this.queueSizeStat.textContent = "-";
      return;
    }

    const totalSteps = this.bfsSteps.length;
    const visitedCount = currentStep.visitedNodes.size;
    const totalNodes = this.allNodes.length;

    this.progressStat.textContent = `${
      this.currentStepIndex + 1
    } / ${totalSteps}`;
    this.levelStat.textContent = currentStep.currentLevel.toString();
    this.visitedStat.textContent = `${visitedCount} / ${totalNodes}`;
    this.queueSizeStat.textContent = currentStep.queue.length.toString();
  }

  private updateStatusBadge(): void {
    const hasTree = this.root !== null;
    const hasStart = this.startNodeValue !== null;
    const hasTarget = this.targetNodeValue !== null;
    const targetFound =
      this.targetFoundAtStep !== -1 &&
      this.currentStepIndex >= this.targetFoundAtStep;
    const searchComplete =
      hasTarget && this.currentStepIndex >= this.bfsSteps.length - 1;

    const steps = [
      {
        text: "Generate tree",
        done: hasTree,
      },
      {
        text: "Select start node",
        done: hasStart,
      },
      {
        text: "Select target node",
        done: hasTarget,
      },
      {
        text:
          this.targetNotFound && searchComplete
            ? "Target not found (not reachable from start)"
            : "Find target node",
        done: targetFound,
        failed: this.targetNotFound && searchComplete,
      },
    ];

    const stepsHtml = steps
      .map((step) => {
        if (step.done) {
          return `<li><span style="text-decoration: line-through;">${step.text}</span> <span style="color: #28a745;">✓</span></li>`;
        } else if (step.failed) {
          return `<li><span style="color: #dc3545;">${step.text}</span> <span style="color: #dc3545;">✗</span></li>`;
        } else {
          return `<li>${step.text}</li>`;
        }
      })
      .join("");

    this.statusList.innerHTML = stepsHtml;
  }

  private updateButtonStates(): void {
    const hasStart = this.startNodeValue !== null && this.bfsSteps.length > 0;
    const atEnd = this.currentStepIndex >= this.bfsSteps.length - 1;
    const hasAnySelection = this.startNodeValue !== null || this.targetNodeValue !== null;

    this.generateBtn.disabled = this.isAnimating;
    this.playBtn.disabled = this.isAnimating || !hasStart || atEnd;
    this.pauseBtn.disabled = !this.isAnimating;
    this.resetBtn.disabled = this.isAnimating || !hasAnySelection;
  }

  private createSVGElement(
    tag: string,
    attrs: { [key: string]: string }
  ): SVGElement {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
    return element;
  }
}
