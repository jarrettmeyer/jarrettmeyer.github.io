export class HeapVisualizer {
  constructor() {
    this.heap = [];
    this.isMinHeap = true;
    this.isAnimating = false;
    this.maxSize = 15;

    this.treeSvg = document.getElementById("treeSvg");
    this.arraySvg = document.getElementById("arraySvg");
    this.elementInput = document.getElementById("elementInput");
    this.pushBtn = document.getElementById("pushBtn");
    this.popBtn = document.getElementById("popBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.minHeapRadio = document.getElementById("minHeapRadio");
    this.maxHeapRadio = document.getElementById("maxHeapRadio");
    this.statusBadge = document.getElementById("statusBadge");

    this.setupEventListeners();
    this.render();
  }

  setupEventListeners() {
    this.pushBtn.addEventListener("click", () => this.handlePush());
    this.popBtn.addEventListener("click", () => this.handlePop());
    this.clearBtn.addEventListener("click", () => this.handleClear());
    this.minHeapRadio.addEventListener("change", () =>
      this.handleToggleHeapType()
    );
    this.maxHeapRadio.addEventListener("change", () =>
      this.handleToggleHeapType()
    );
    this.elementInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.handlePush();
    });
  }

  handleToggleHeapType() {
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

  handlePush() {
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
    this.bubbleUp(insertIndex);
  }

  handleClear() {
    if (this.isAnimating) return;
    this.heap = [];
    this.render();
  }

  compare(a, b) {
    return this.isMinHeap ? a < b : a > b;
  }

  getParentIndex(i) {
    return Math.floor((i - 1) / 2);
  }

  getLeftChildIndex(i) {
    return 2 * i + 1;
  }

  getRightChildIndex(i) {
    return 2 * i + 2;
  }

  async bubbleUp(index) {
    if (index === 0) {
      this.render();
      this.isAnimating = false;
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
    }
  }

  async bubbleDown(index) {
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
    }
  }

  async handlePop() {
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
    this.render();
  }

  animateSwap(index1, index2) {
    return new Promise((resolve) => {
      this.highlightNodes([index1, index2], "yellow");
      setTimeout(() => {
        this.highlightNodes([index1, index2], "green");
        setTimeout(resolve, 800);
      }, 600);
    });
  }

  animatePop(index) {
    return new Promise((resolve) => {
      this.highlightNodes([index], "red");
      setTimeout(resolve, 800);
    });
  }

  highlightNodes(indices, color) {
    this.renderTree(indices, color);
    this.renderArray(indices, color);
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  render() {
    this.updateStatusBadge();
    this.updateButtonStates();
    this.renderTree();
    this.renderArray();
  }

  updateStatusBadge() {
    this.statusBadge.textContent = `${this.heap.length}/${this.maxSize}`;
    if (this.heap.length === this.maxSize) {
      this.statusBadge.style.backgroundColor = "#dc3545";
    } else if (this.heap.length === 0) {
      this.statusBadge.style.backgroundColor = "#6c757d";
    } else {
      this.statusBadge.style.backgroundColor = "#0d6efd";
    }
  }

  updateButtonStates() {
    this.pushBtn.disabled =
      this.isAnimating || this.heap.length >= this.maxSize;
    this.popBtn.disabled = this.isAnimating || this.heap.length === 0;
    this.clearBtn.disabled = this.isAnimating;
    this.elementInput.disabled = this.isAnimating;
  }

  renderTree(highlightIndices = [], highlightColor = "") {
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

    // Draw nodes
    for (let i = 0; i < this.heap.length; i++) {
      const pos = positions[i];
      const isHighlighted = highlightIndices.includes(i);
      this.drawNode(pos.x, pos.y, this.heap[i], isHighlighted, highlightColor);
    }
  }

  calculateTreePositions(svgWidth, svgHeight, nodeRadius) {
    const positions = [];
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

  drawEdge(from, to) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", from.x);
    line.setAttribute("y1", from.y);
    line.setAttribute("x2", to.x);
    line.setAttribute("y2", to.y);
    line.setAttribute("stroke", "#666");
    line.setAttribute("stroke-width", "2");
    this.treeSvg.appendChild(line);
  }

  drawNode(x, y, value, highlight = false, color = "") {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
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

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("fill", "#fff");
    text.setAttribute("font-size", "16");
    text.setAttribute("font-weight", "bold");
    text.textContent = value;
    this.treeSvg.appendChild(text);
  }

  renderArray(highlightIndices = [], highlightColor = "") {
    this.arraySvg.innerHTML = "";

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
      this.arraySvg.appendChild(text);
      return;
    }

    const svgWidth = this.arraySvg.clientWidth;
    const cellWidth = 60;
    const cellHeight = 60;
    const padding = 20;
    const startX = Math.max(padding, (svgWidth - this.maxSize * cellWidth) / 2);
    const startY = 60;

    // Draw indices
    for (let i = 0; i < this.maxSize; i++) {
      const x = startX + i * cellWidth;
      const indexText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      indexText.setAttribute("x", x + cellWidth / 2);
      indexText.setAttribute("y", startY - 25);
      indexText.setAttribute("text-anchor", "middle");
      indexText.setAttribute("fill", "#999");
      indexText.setAttribute("font-size", "12");
      indexText.textContent = i;
      this.arraySvg.appendChild(indexText);
    }

    // Draw cells
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
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", cellWidth);
      rect.setAttribute("height", cellHeight);
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

      // Draw value
      if (isFilled) {
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("x", x + cellWidth / 2);
        text.setAttribute("y", y + cellHeight / 2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#fff");
        text.setAttribute("font-size", "18");
        text.setAttribute("font-weight", "bold");
        text.textContent = this.heap[i];
        this.arraySvg.appendChild(text);
      }
    }

    // Draw legend
    const legendY = startY + cellHeight + 20;
    this.drawLegendItem(startX, legendY, "#ffc107", "Comparison");
    this.drawLegendItem(startX + 150, legendY, "#28a745", "Swap/Move");
    this.drawLegendItem(startX + 300, legendY, "#dc3545", "Remove");
  }

  drawLegendItem(x, y, color, label) {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", x);
    rect.setAttribute("y", y);
    rect.setAttribute("width", "15");
    rect.setAttribute("height", "15");
    rect.setAttribute("fill", color);
    this.arraySvg.appendChild(rect);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x + 25);
    text.setAttribute("y", y + 12);
    text.setAttribute("fill", "#ccc");
    text.setAttribute("font-size", "12");
    text.textContent = label;
    this.arraySvg.appendChild(text);
  }

  getHighlightColor(color) {
    const colors = {
      yellow: "#ffc107",
      green: "#28a745",
      red: "#dc3545",
    };
    return colors[color] || "#0d6efd";
  }
}
