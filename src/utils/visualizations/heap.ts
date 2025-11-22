interface Position {
  x: number;
  y: number;
}

export class HeapVisualizer {
  private heap: number[] = [];
  private isMinHeap: boolean = true;
  private isAnimating: boolean = false;
  private maxSize: number = 15;
  private compareDuration: number = 500;
  private swapDuration: number = 1000;

  private treeSvg: SVGSVGElement;
  private arraySvg: SVGSVGElement;
  private elementInput: HTMLInputElement;
  private pushBtn: HTMLButtonElement;
  private popBtn: HTMLButtonElement;
  private clearBtn: HTMLButtonElement;
  private minHeapRadio: HTMLInputElement;
  private maxHeapRadio: HTMLInputElement;
  private statusBadge: HTMLElement;

  constructor() {
    this.heap = [];
    this.isMinHeap = true;
    this.isAnimating = false;
    this.maxSize = 15;

    const treeSvg = document.getElementById("treeSvg") as SVGSVGElement | null;
    const arraySvg = document.getElementById("arraySvg") as SVGSVGElement | null;
    const elementInput = document.getElementById(
      "elementInput"
    ) as HTMLInputElement | null;
    const pushBtn = document.getElementById("pushBtn") as HTMLButtonElement | null;
    const popBtn = document.getElementById("popBtn") as HTMLButtonElement | null;
    const clearBtn = document.getElementById(
      "clearBtn"
    ) as HTMLButtonElement | null;
    const minHeapRadio = document.getElementById(
      "minHeapRadio"
    ) as HTMLInputElement | null;
    const maxHeapRadio = document.getElementById(
      "maxHeapRadio"
    ) as HTMLInputElement | null;
    const statusBadge = document.getElementById("statusBadge") as HTMLElement | null;

    if (!treeSvg || !arraySvg || !elementInput || !pushBtn || !popBtn || !clearBtn || !minHeapRadio || !maxHeapRadio || !statusBadge) {
      throw new Error("Required elements not found in the DOM");
    }

    this.treeSvg = treeSvg;
    this.arraySvg = arraySvg;
    this.elementInput = elementInput;
    this.pushBtn = pushBtn;
    this.popBtn = popBtn;
    this.clearBtn = clearBtn;
    this.minHeapRadio = minHeapRadio;
    this.maxHeapRadio = maxHeapRadio;
    this.statusBadge = statusBadge;

    this.setupEventListeners();
    this.render();
  }

  private setupEventListeners(): void {
    this.pushBtn.addEventListener("click", () => this.handlePush());
    this.popBtn.addEventListener("click", () => void this.handlePop());
    this.clearBtn.addEventListener("click", () => this.handleClear());
    this.minHeapRadio.addEventListener("change", () =>
      this.handleToggleHeapType()
    );
    this.maxHeapRadio.addEventListener("change", () =>
      this.handleToggleHeapType()
    );
    this.elementInput.addEventListener("keypress", (e: KeyboardEvent) => {
      if (e.key === "Enter") this.handlePush();
    });
  }

  private handleToggleHeapType(): void {
    const newHeapType = this.minHeapRadio.checked;

    // If heap is not empty and we're actually changing the type, show confirmation
    if (this.heap.length > 0 && newHeapType !== this.isMinHeap) {
      const heapTypeName = newHeapType ? "Min Heap" : "Max Heap";
      const confirmed = confirm(
        `Switching to ${heapTypeName} will clear the current heap. Continue?`
      );

      if (!confirmed) {
        // Revert the radio button selection
        if (this.isMinHeap) {
          this.minHeapRadio.checked = true;
          this.maxHeapRadio.checked = false;
        } else {
          this.minHeapRadio.checked = false;
          this.maxHeapRadio.checked = true;
        }
        return;
      }

      // Clear the heap
      this.heap = [];
    }

    this.isMinHeap = newHeapType;
    this.render();
  }

  private handlePush(): void {
    if (this.isAnimating) return;
    if (this.heap.length >= this.maxSize) {
      alert(`Maximum heap size (${this.maxSize}) reached!`);
      return;
    }

    const value = parseInt(this.elementInput.value);
    if (isNaN(value)) {
      alert("Please enter a number");
      return;
    }

    this.heap.push(value);
    this.elementInput.value = "";
    const insertIndex = this.heap.length - 1;
    this.isAnimating = true;
    void this.bubbleUp(insertIndex);
  }

  private handleClear(): void {
    if (this.isAnimating) return;
    this.heap = [];
    this.render();
  }

  private compare(a: number, b: number): boolean {
    return this.isMinHeap ? a < b : a > b;
  }

  private getParentIndex(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  private getLeftChildIndex(i: number): number {
    return 2 * i + 1;
  }

  private getRightChildIndex(i: number): number {
    return 2 * i + 2;
  }

  private async bubbleUp(index: number): Promise<void> {
    if (index === 0) {
      this.render();
      this.isAnimating = false;
      this.updateButtonStates();
      return;
    }

    const parentIndex = this.getParentIndex(index);

    if (this.compare(this.heap[index], this.heap[parentIndex])) {
      await this.animateSwap(index, parentIndex);
      [this.heap[index], this.heap[parentIndex]] = [
        this.heap[parentIndex],
        this.heap[index],
      ];
      this.render();
      await this.delay(500);
      await this.bubbleUp(parentIndex);
    } else {
      this.render();
      this.isAnimating = false;
      this.updateButtonStates();
    }
  }

  private async bubbleDown(index: number): Promise<void> {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let smallest = index;

    if (
      leftChildIndex < this.heap.length &&
      this.compare(this.heap[leftChildIndex], this.heap[smallest])
    ) {
      smallest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.compare(this.heap[rightChildIndex], this.heap[smallest])
    ) {
      smallest = rightChildIndex;
    }

    if (smallest !== index) {
      await this.animateSwap(index, smallest);
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      this.render();
      await this.delay(500);
      await this.bubbleDown(smallest);
    } else {
      this.render();
      this.isAnimating = false;
      this.updateButtonStates();
    }
  }

  private async handlePop(): Promise<void> {
    if (this.isAnimating) return;
    if (this.heap.length === 0) return;

    this.isAnimating = true;
    await this.animatePop(0);

    if (this.heap.length === 1) {
      this.heap.pop();
      this.render();
    } else {
      // Move last element to root
      this.heap[0] = this.heap[this.heap.length - 1];
      this.heap.pop();
      this.render();
      await this.delay(500);
      await this.bubbleDown(0);
    }

    this.isAnimating = false;
    this.updateButtonStates();
    this.render();
  }

  private async animateSwap(index1: number, index2: number): Promise<void> {
    // Step 1: Show yellow highlight for comparison
    this.highlightNodes([index1, index2], "yellow");
    await this.delay(this.compareDuration);

    // Step 2: Turn nodes green and animate text movement simultaneously
    this.highlightNodesPreservePositions([index1, index2], "green");
    await this.animateTextSwap(index1, index2, this.swapDuration);

    // Step 3: Update text elements to show the swapped values
    const treeTexts = this.treeSvg.querySelectorAll("text");
    const arrayTexts = this.arraySvg.querySelectorAll("text");

    if (treeTexts && treeTexts.length > 0) {
      const temp = (treeTexts[index1] as SVGTextElement).textContent;
      (treeTexts[index1] as SVGTextElement).textContent = (treeTexts[index2] as SVGTextElement).textContent;
      (treeTexts[index2] as SVGTextElement).textContent = temp;
    }

    if (arrayTexts && arrayTexts.length > 0) {
      const offset = this.maxSize;
      if (index1 + offset < arrayTexts.length && index2 + offset < arrayTexts.length) {
        const temp = (arrayTexts[index1 + offset] as SVGTextElement).textContent;
        (arrayTexts[index1 + offset] as SVGTextElement).textContent = (arrayTexts[index2 + offset] as SVGTextElement).textContent;
        (arrayTexts[index2 + offset] as SVGTextElement).textContent = temp;
      }
    }
  }

  private highlightNodesPreservePositions(
    indices: number[],
    color: string
  ): void {
    // Update only the circle colors without re-rendering text positions
    const treeCircles = this.treeSvg.querySelectorAll("circle");
    const arrayRects = this.arraySvg.querySelectorAll("rect");

    // Update tree circles
    for (let i = 0; i < treeCircles.length; i++) {
      if (indices.includes(i)) {
        (treeCircles[i] as SVGCircleElement).setAttribute(
          "fill",
          this.getHighlightColor(color)
        );
      }
    }

    // Update array cells - skip the first maxSize rects (they're indices), update actual cells
    let cellIndex = 0;
    for (let i = 0; i < arrayRects.length; i++) {
      const rect = arrayRects[i] as SVGRectElement;
      // Check if this is a data cell (has y > 50)
      const y = parseFloat(rect.getAttribute("y") || "0");
      if (y > 50) {
        if (indices.includes(cellIndex)) {
          rect.setAttribute("fill", this.getHighlightColor(color));
        }
        cellIndex++;
      }
    }
  }

  private animatePop(index: number): Promise<void> {
    return new Promise((resolve) => {
      this.highlightNodes([index], "red");
      // Fade out the text element being removed
      const treeTexts = this.treeSvg.querySelectorAll("text");
      const arrayTexts = this.arraySvg.querySelectorAll("text");

      if (treeTexts && index < treeTexts.length) {
        (treeTexts[index] as SVGTextElement).style.opacity = "0";
      }

      if (arrayTexts) {
        const arrayTextIndex = index + this.maxSize;
        if (arrayTextIndex < arrayTexts.length) {
          (arrayTexts[arrayTextIndex] as SVGTextElement).style.opacity = "0";
        }
      }

      setTimeout(resolve, 800);
    });
  }

  private highlightNodes(indices: number[], color: string): void {
    this.renderTree(indices, color);
    this.renderArray(indices, color);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private easeInOutQuad(t: number): number {
    // t is normalized progress (0 to 1)
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  private getTreeNodePosition(index: number): Position {
    const svgWidth = this.treeSvg.clientWidth;
    const svgHeight = this.treeSvg.clientHeight;
    const nodeRadius = 25;
    const levels = Math.ceil(Math.log2(this.heap.length + 1));

    const level = Math.floor(Math.log2(index + 1));
    const positionInLevel = index - (Math.pow(2, level) - 1);
    const nodesAtLevel = Math.pow(2, level);

    const levelHeight = (svgHeight - 80) / Math.max(1, levels - 1);
    const y = 40 + level * levelHeight;

    const levelWidth = svgWidth - 60;
    const spacing = levelWidth / (nodesAtLevel + 1);
    const x = spacing * (positionInLevel + 1) + 30;

    return { x, y };
  }

  private getArrayCellPosition(index: number): Position {
    const svgWidth = this.arraySvg.clientWidth;
    const cellWidth = 60;
    const cellHeight = 60;
    const padding = 20;
    const startX = Math.max(padding, (svgWidth - this.maxSize * cellWidth) / 2);
    const startY = 60;

    const x = startX + index * cellWidth + cellWidth / 2;
    const y = startY + cellHeight / 2;

    return { x, y };
  }

  private animateTextSwap(
    fromIndex: number,
    toIndex: number,
    duration: number
  ): Promise<void> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const fromTreePos = this.getTreeNodePosition(fromIndex);
      const toTreePos = this.getTreeNodePosition(toIndex);
      const fromArrayPos = this.getArrayCellPosition(fromIndex);
      const toArrayPos = this.getArrayCellPosition(toIndex);

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = this.easeInOutQuad(progress);

        // Animate tree text
        const treeTexts = this.treeSvg.querySelectorAll("text");
        if (treeTexts && treeTexts.length > 0) {
          const treeTextElements = Array.from(treeTexts);
          if (fromIndex < treeTextElements.length) {
            const fromText = treeTextElements[fromIndex];
            const currentX = fromTreePos.x + (toTreePos.x - fromTreePos.x) * eased;
            const currentY = fromTreePos.y + (toTreePos.y - fromTreePos.y) * eased;
            fromText.setAttribute("x", currentX.toString());
            fromText.setAttribute("y", currentY.toString());
          }
          if (toIndex < treeTextElements.length) {
            const toText = treeTextElements[toIndex];
            const currentX = toTreePos.x + (fromTreePos.x - toTreePos.x) * eased;
            const currentY = toTreePos.y + (fromTreePos.y - toTreePos.y) * eased;
            toText.setAttribute("x", currentX.toString());
            toText.setAttribute("y", currentY.toString());
          }
        }

        // Animate array text
        const arrayTexts = this.arraySvg.querySelectorAll("text");
        if (arrayTexts && arrayTexts.length > 0) {
          // Skip index labels (first maxSize text elements)
          const offset = this.maxSize;
          if (fromIndex + offset < arrayTexts.length) {
            const fromText = arrayTexts[fromIndex + offset];
            const currentX = fromArrayPos.x + (toArrayPos.x - fromArrayPos.x) * eased;
            const currentY = fromArrayPos.y + (toArrayPos.y - fromArrayPos.y) * eased;
            fromText.setAttribute("x", currentX.toString());
            fromText.setAttribute("y", currentY.toString());
          }
          if (toIndex + offset < arrayTexts.length) {
            const toText = arrayTexts[toIndex + offset];
            const currentX = toArrayPos.x + (fromArrayPos.x - toArrayPos.x) * eased;
            const currentY = toArrayPos.y + (fromArrayPos.y - toArrayPos.y) * eased;
            toText.setAttribute("x", currentX.toString());
            toText.setAttribute("y", currentY.toString());
          }
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Reset text positions to their original locations after animation
          if (treeTexts && treeTexts.length > 0) {
            const treeTextElements = Array.from(treeTexts);
            if (fromIndex < treeTextElements.length) {
              (treeTextElements[fromIndex] as SVGTextElement).setAttribute("x", fromTreePos.x.toString());
              (treeTextElements[fromIndex] as SVGTextElement).setAttribute("y", fromTreePos.y.toString());
            }
            if (toIndex < treeTextElements.length) {
              (treeTextElements[toIndex] as SVGTextElement).setAttribute("x", toTreePos.x.toString());
              (treeTextElements[toIndex] as SVGTextElement).setAttribute("y", toTreePos.y.toString());
            }
          }

          if (arrayTexts && arrayTexts.length > 0) {
            const offset = this.maxSize;
            if (fromIndex + offset < arrayTexts.length) {
              (arrayTexts[fromIndex + offset] as SVGTextElement).setAttribute("x", fromArrayPos.x.toString());
              (arrayTexts[fromIndex + offset] as SVGTextElement).setAttribute("y", fromArrayPos.y.toString());
            }
            if (toIndex + offset < arrayTexts.length) {
              (arrayTexts[toIndex + offset] as SVGTextElement).setAttribute("x", toArrayPos.x.toString());
              (arrayTexts[toIndex + offset] as SVGTextElement).setAttribute("y", toArrayPos.y.toString());
            }
          }

          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  private render(): void {
    this.updateStatusBadge();
    this.updateButtonStates();
    this.renderTree();
    this.renderArray();
  }

  private updateStatusBadge(): void {
    this.statusBadge.textContent = `${this.heap.length}/${this.maxSize}`;
    if (this.heap.length === this.maxSize) {
      this.statusBadge.style.backgroundColor = "#dc3545";
    } else if (this.heap.length === 0) {
      this.statusBadge.style.backgroundColor = "#6c757d";
    } else {
      this.statusBadge.style.backgroundColor = "#0d6efd";
    }
  }

  private updateButtonStates(): void {
    this.pushBtn.disabled =
      this.isAnimating || this.heap.length >= this.maxSize;
    this.popBtn.disabled = this.isAnimating || this.heap.length === 0;
    this.clearBtn.disabled = this.isAnimating;
  }

  private renderTree(
    highlightIndices: number[] = [],
    highlightColor: string = ""
  ): void {
    this.treeSvg.innerHTML = "";

    if (this.heap.length === 0) {
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.setAttribute("x", "50%");
      text.setAttribute("y", "50%");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("fill", "#999");
      text.setAttribute("font-size", "16");
      text.textContent = "Heap is empty";
      this.treeSvg.appendChild(text);
      return;
    }

    const svgWidth = this.treeSvg.clientWidth;
    const svgHeight = this.treeSvg.clientHeight;
    const nodeRadius = 25;

    // Calculate node positions
    const positions = this.calculateTreePositions(
      svgWidth,
      svgHeight,
      nodeRadius
    );

    // Draw edges
    for (let i = 0; i < this.heap.length; i++) {
      const leftChildIndex = this.getLeftChildIndex(i);
      const rightChildIndex = this.getRightChildIndex(i);

      if (leftChildIndex < this.heap.length) {
        this.drawEdge(positions[i], positions[leftChildIndex]);
      }
      if (rightChildIndex < this.heap.length) {
        this.drawEdge(positions[i], positions[rightChildIndex]);
      }
    }

    // Draw circles (not text)
    for (let i = 0; i < this.heap.length; i++) {
      const pos = positions[i];
      const isHighlighted = highlightIndices.includes(i);
      this.drawCircle(pos.x, pos.y, isHighlighted, highlightColor);
    }

    // Draw text (on top of circles)
    for (let i = 0; i < this.heap.length; i++) {
      const pos = positions[i];
      this.drawNodeText(pos.x, pos.y, this.heap[i]);
    }
  }

  private calculateTreePositions(
    svgWidth: number,
    svgHeight: number,
    nodeRadius: number
  ): Position[] {
    const positions: Position[] = [];
    const levels = Math.ceil(Math.log2(this.heap.length + 1));

    for (let i = 0; i < this.heap.length; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const positionInLevel = i - (Math.pow(2, level) - 1);
      const nodesAtLevel = Math.pow(2, level);

      const levelHeight = (svgHeight - 80) / Math.max(1, levels - 1);
      const y = 40 + level * levelHeight;

      // Center the nodes for each level
      const levelWidth = svgWidth - 60; // Account for padding
      const spacing = levelWidth / (nodesAtLevel + 1);
      const x = spacing * (positionInLevel + 1) + 30; // 30 is left padding

      positions.push({ x, y });
    }

    return positions;
  }

  private drawEdge(from: Position, to: Position): void {
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line.setAttribute("x1", from.x.toString());
    line.setAttribute("y1", from.y.toString());
    line.setAttribute("x2", to.x.toString());
    line.setAttribute("y2", to.y.toString());
    line.setAttribute("stroke", "#666");
    line.setAttribute("stroke-width", "2");
    this.treeSvg.appendChild(line);
  }

  private drawCircle(
    x: number,
    y: number,
    highlight: boolean = false,
    color: string = ""
  ): void {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", x.toString());
    circle.setAttribute("cy", y.toString());
    circle.setAttribute("r", "25");
    circle.setAttribute(
      "fill",
      highlight ? this.getHighlightColor(color) : "#0d6efd"
    );
    circle.setAttribute("stroke", "#fff");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("class", "heap-node");
    if (highlight) {
      circle.classList.add(`highlight-${color}`);
    }
    this.treeSvg.appendChild(circle);
  }

  private drawNodeText(x: number, y: number, value: number): void {
    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("x", x.toString());
    text.setAttribute("y", y.toString());
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "16");
    text.setAttribute("font-weight", "bold");
    text.textContent = value.toString();
    this.treeSvg.appendChild(text);
  }

  private renderArray(
    highlightIndices: number[] = [],
    highlightColor: string = ""
  ): void {
    this.arraySvg.innerHTML = "";

    const svgWidth = this.arraySvg.clientWidth;
    const cellWidth = 60;
    const cellHeight = 60;
    const padding = 20;
    const startX = Math.max(padding, (svgWidth - this.maxSize * cellWidth) / 2);
    const startY = 60;

    // Draw all rect elements first (so text appears on top)
    for (let i = 0; i < this.maxSize; i++) {
      const x = startX + i * cellWidth;
      const y = startY;
      const isHighlighted = highlightIndices.includes(i);
      const isFilled = i < this.heap.length;

      // Draw cell border
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x.toString());
      rect.setAttribute("y", y.toString());
      rect.setAttribute("width", cellWidth.toString());
      rect.setAttribute("height", cellHeight.toString());
      rect.setAttribute(
        "fill",
        isFilled
          ? isHighlighted
            ? this.getHighlightColor(highlightColor)
            : "#0d6efd"
          : "rgba(255,255,255,0.1)"
      );
      rect.setAttribute("stroke", isFilled ? "#fff" : "#666");
      rect.setAttribute("stroke-width", "2");
      rect.setAttribute("class", "array-cell");
      if (isHighlighted) {
        rect.classList.add(`highlight-${highlightColor}`);
      }
      this.arraySvg.appendChild(rect);
    }

    // Draw all text elements (on top of rects)
    // Draw indices
    for (let i = 0; i < this.maxSize; i++) {
      const x = startX + i * cellWidth;
      const indexText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      indexText.setAttribute("x", (x + cellWidth / 2).toString());
      indexText.setAttribute("y", (startY - 25).toString());
      indexText.setAttribute("text-anchor", "middle");
      indexText.setAttribute("fill", "#999");
      indexText.setAttribute("font-size", "12");
      indexText.textContent = i.toString();
      this.arraySvg.appendChild(indexText);
    }

    // Draw cell values
    for (let i = 0; i < this.maxSize; i++) {
      const x = startX + i * cellWidth;
      const y = startY;
      const isFilled = i < this.heap.length;

      // Draw value
      if (isFilled) {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", (x + cellWidth / 2).toString());
        text.setAttribute("y", (y + cellHeight / 2).toString());
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#fff");
        text.setAttribute("font-size", "18");
        text.setAttribute("font-weight", "bold");
        text.textContent = this.heap[i].toString();
        this.arraySvg.appendChild(text);
      }
    }

    // Draw legend
    const legendY = startY + cellHeight + 20;
    this.drawLegendItem(startX, legendY, "#ffc107", "Compare");
    this.drawLegendItem(startX + 150, legendY, "#28a745", "Swap");
    this.drawLegendItem(startX + 300, legendY, "#dc3545", "Remove");
  }

  private drawLegendItem(
    x: number,
    y: number,
    color: string,
    label: string
  ): void {
    const rect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rect.setAttribute("x", x.toString());
    rect.setAttribute("y", y.toString());
    rect.setAttribute("width", "15");
    rect.setAttribute("height", "15");
    rect.setAttribute("fill", color);
    this.arraySvg.appendChild(rect);

    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("x", (x + 25).toString());
    text.setAttribute("y", (y + 12).toString());
    text.setAttribute("fill", "#ccc");
    text.setAttribute("font-size", "12");
    text.textContent = label;
    this.arraySvg.appendChild(text);
  }

  private getHighlightColor(color: string): string {
    const colors: { [key: string]: string } = {
      yellow: "#ffc107",
      green: "#28a745",
      red: "#dc3545",
    };
    return colors[color] || "#0d6efd";
  }
}
