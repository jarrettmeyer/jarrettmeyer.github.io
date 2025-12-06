# Binary Tree BFS Visualization Implementation Plan

## Overview
Create an interactive binary tree breadth-first search visualization page following the patterns established in the heap visualization (`src/pages/visualize/heap.astro`). The visualization will demonstrate BFS algorithm execution with multiple educational features including queue state display, visit order numbers, level highlighting, and depth indicators.

## Files to Create

### 1. `/src/pages/visualize/bfs.astro`
Main page file following the heap.astro structure with:
- PageLayout wrapper with title, description, includeInSearchResults
- Educational content section explaining BFS algorithm
- Instructions section using Alert component
- Controls section for tree generation and playback
- Three visualization panels: tree view, queue view, statistics
- Scoped styles for animations
- Script tag to initialize BFSVisualizer

### 2. `/src/scripts/visualize/bfs.ts`
Client-side TypeScript class following heap.ts patterns with:
- BFSVisualizer class with private properties for state management
- Direct SVG manipulation using `document.createElementNS()`
- Animation framework with async/await and requestAnimationFrame
- Event handlers for user interactions
- Rendering methods for tree, queue, and statistics

## Key Implementation Details

### Data Structures

**TreeNode Interface:**
```typescript
interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;  // SVG position
  y?: number;
}
```

**BFSStep Interface:**
```typescript
interface BFSStep {
  type: 'enqueue' | 'dequeue' | 'visit';
  nodeValue: number;
  queue: number[];
  visitedNodes: Set<number>;
  visitOrder: Map<number, number>;
  currentLevel: number;
  levelNodes: Set<number>;
}
```

**Color Enum (extended from heap):**
```typescript
enum Color {
  Blue = "#0d6efd",     // Visited nodes
  Yellow = "#ffc107",   // Active operation
  Green = "#28a745",    // Queue boxes
  Red = "#dc3545",      // Error state
  Purple = "#6f42c1",   // Selected start node
  Orange = "#fd7e14",   // Level highlighting
  White = "#fff",
  LightGray = "#999",
  DarkGray = "#666",
}
```

### Random Tree Generation

Use level-order construction with decreasing probability:
- Start with root node (random value 1-99)
- Use queue to process nodes level by level
- Probability of adding child: `0.8 * Math.pow(0.7, currentLevel)`
- This creates semi-balanced trees that fit viewport well
- Size range: 7-15 nodes (configurable via slider)

### BFS Algorithm Implementation

Pre-compute all BFS steps upfront to enable bidirectional navigation:
1. Find start node by value (user-selected)
2. Initialize queue with start node
3. For each iteration:
   - Dequeue front node (create step)
   - Visit node (create step, mark as visited, assign visit order number)
   - Enqueue left child if exists and not visited (create step)
   - Enqueue right child if exists and not visited (create step)
4. Track current level and nodes at each level

### Required Features

#### 1. Tree View (Primary Visualization)
- SVG panel (100% width × 450px height)
- Binary tree layout using level-based positioning
- Node states indicated by color:
  - Gray (#666): Unvisited
  - Purple (#6f42c1): Selected start node
  - Yellow (#ffc107): Currently visiting
  - Blue (#0d6efd): Visited (with white visit order number)
- Orange border (3px stroke): All nodes at current level
- Clickable nodes to select BFS starting point
- Edges connecting parent-child relationships

#### 2. Queue State View (Secondary Visualization)
- Horizontal SVG panel (100% width × 120px height)
- Green boxes (#28a745) showing current queue contents
- Layout: `[front] ← ← ← ← [back]`
- Each box shows node value in white text
- Empty state shows "Queue is empty" message
- Updates in real-time with BFS execution

#### 3. Visit Order Numbers
- Small white numbers displayed on visited nodes
- Sequential numbering (1, 2, 3...) showing BFS traversal order
- Positioned on blue filled nodes
- Font size 10px to avoid clutter

#### 4. Level/Depth Indicators
- Displayed in statistics panel
- Shows current depth level from start node
- Updates as BFS progresses through levels

#### 5. Current Level Highlighting
- Orange border (#fd7e14, 3px stroke) on nodes at current depth
- Subtle pulse animation (0.6s ease-in-out)
- Visually groups nodes being processed together

### Page Structure

**Educational Content Section:**
- What is BFS? (definition, queue-based, level-order)
- Key characteristics (complete, optimal for shortest path)
- BFS vs DFS comparison
- Real-world applications (social networks, web crawlers, GPS routing)

**Instructions Section (Alert component):**
1. Generate tree using slider and button
2. Click node to select start point
3. Use playback controls (play, pause, next, previous, reset)
4. Adjust speed (0.25x to 2x)
5. Observe the four visualization features

**Controls Section:**
- Row 1:
  - Tree size slider (7-15 nodes)
  - "Generate New Tree" button
  - Status badge (shows selected node or prompt)
- Row 2:
  - Play button (auto-animate)
  - Pause button
  - Speed dropdown (0.25x, 0.5x, 1x, 1.5x, 2x)
  - Previous button (step backward, instant)
  - Next button (step forward, animated)
  - Reset button

**Statistics Panel (Bootstrap cards):**
- Progress: "Step X / Y"
- Current Level: depth number
- Nodes Visited: "X / Y"
- Queue Size: current count

### Animation Sequences

Following heap visualization timing patterns:

**Dequeue (500ms):**
1. Yellow highlight on front queue box (300ms)
2. Fade out and shift remaining boxes left (200ms)

**Visit (800ms):**
1. Tree node yellow fill (400ms)
2. Transition to blue fill (200ms)
3. Visit order number fade-in (200ms)

**Enqueue (500ms):**
1. Tree node yellow outline flash (200ms)
2. Green box slides in at queue back (300ms)

**Level Highlight (Continuous):**
- Orange border on current level nodes
- Gentle pulse animation

### Controls Implementation

**Custom Controls (NOT PlayControl component):**
- Discrete step navigation better suits algorithm stepping
- Previous button: instant state update (no animation)
- Next button: full animation sequence
- Play button: auto-loop through steps with speed multiplier
- Pause button: stop auto-play
- Reset button: return to step -1 (initial state)

**Button State Logic:**
- Generate/Size slider: disabled while animating
- Play: disabled if animating, no start selected, or at end
- Pause: disabled if not animating
- Previous: disabled if animating or at step 0
- Next: disabled if animating, no start selected, or at end
- Reset: disabled if animating or at step -1

### Node Positioning Algorithm

Use recursive level-based calculation similar to heap:
```typescript
function assignPositions(
  node: TreeNode,
  x: number,
  y: number,
  horizontalSpace: number,
  level: number
) {
  node.x = x;
  node.y = y;

  const verticalSpacing = (svgHeight - 80) / treeDepth;
  const childY = y + verticalSpacing;
  const childSpace = horizontalSpace / 2;

  if (node.left) {
    assignPositions(node.left, x - horizontalSpace / 4, childY, childSpace, level + 1);
  }

  if (node.right) {
    assignPositions(node.right, x + horizontalSpace / 4, childY, childSpace, level + 1);
  }
}
```

### State Management

**BFSVisualizer Class Properties:**
```typescript
// Tree structure
private root: TreeNode | null = null;
private allNodes: TreeNode[] = [];

// BFS state
private startNodeValue: number | null = null;
private bfsSteps: BFSStep[] = [];
private currentStepIndex: number = -1;

// Animation
private isAnimating: boolean = false;
private animationSpeed: number = 1000;
private speedMultiplier: number = 1;

// DOM elements (similar to heap.ts)
private treeSvg: SVGSVGElement;
private queueSvg: SVGSVGElement;
private generateBtn: HTMLButtonElement;
private treeSizeSlider: HTMLInputElement;
// ... etc
```

### Code Organization

**Core Methods:**
- `constructor()` - Initialize DOM refs, setup listeners, render
- `generateTree(size: number)` - Create random binary tree
- `calculateNodePositions(root)` - Assign x, y coordinates
- `handleNodeClick(value)` - Select start node, compute BFS steps
- `computeBFSSteps(root, startValue)` - Pre-compute all steps
- `handleNext()` - Step forward with animation
- `handlePrevious()` - Step backward (instant)
- `handlePlay()` - Auto-play loop
- `handlePause()` - Stop auto-play
- `handleReset()` - Return to initial state
- `render()` - Update all visualizations
- `renderTree()` - Draw binary tree with states
- `renderQueue()` - Draw queue boxes
- `renderStats()` - Update statistics panel
- `animateStep(step)` - Execute step animations
- `updateButtonStates()` - Enable/disable controls
- `delay(ms)` - Promise-based delay
- `easeInOutQuad(t)` - Easing function (from heap)

**Helper Functions:**
- `createSVGElement(tag, attrs)` - Reusable SVG creation
- `findNodeByValue(value)` - Traverse tree to find node
- `flattenTree(node)` - Convert tree to array
- `getTreeDepth(node)` - Calculate max depth
- `randomInt(min, max)` - Random number generator

### Responsive Design

- SVG containers use `width="100%"` for fluid layouts
- Bootstrap grid system for control panels
- Media query at 768px for mobile adjustments
- Queue panel stacks below tree on small screens
- Tappable nodes (min 44px touch target) for mobile

### Testing Considerations

**Edge Cases:**
- Single node tree (just root)
- Maximum 15-node tree
- Unbalanced trees (skews left or right)
- Changing start node mid-execution
- Speed adjustments during animation
- Reset and re-run from different nodes

**Browser Compatibility:**
- Chrome (primary)
- Firefox
- Safari
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## Critical Files to Reference

### Pattern Files (READ THESE):
1. **`/src/pages/visualize/heap.astro`** - Page structure, educational content layout, controls organization
2. **`/src/scripts/visualize/heap.ts`** - Class structure, animation patterns, SVG manipulation, state management
3. **`/src/components/Alert.astro`** - Instructions section wrapper
4. **`/src/layouts/PageLayout.astro`** - Page wrapper with SEO and navigation

### Utility Files (REFERENCE IF NEEDED):
5. **`/src/components/PlayControl.tsx`** - Reference only (we're using custom controls)
6. **`/src/utils/hooks/useDimensions.ts`** - Optional for responsive sizing

## Implementation Sequence

### Phase 1: Core Structure
1. Create `bfs.astro` with static page layout
2. Create `bfs.ts` with class skeleton and interfaces
3. Define all TypeScript types and enums

### Phase 2: Tree Generation
4. Implement `generateRandomTree()` with level-order construction
5. Implement `calculateNodePositions()` for tree layout
6. Implement `renderTree()` with SVG creation
7. Test tree generation and display

### Phase 3: Node Selection
8. Add click handlers to tree nodes
9. Implement start node selection (purple highlight)
10. Implement `computeBFSSteps()` algorithm
11. Test step generation with console logging

### Phase 4: Step Navigation
12. Implement `handleNext()` with animations
13. Implement `handlePrevious()` instant update
14. Implement `handleReset()`
15. Wire up button event listeners
16. Test manual stepping

### Phase 5: Visualizations
17. Implement `renderQueue()` for queue SVG
18. Add visit order numbers to visited nodes
19. Add level highlighting (orange border)
20. Implement statistics panel updates
21. Test all 4 visualization features

### Phase 6: Auto-Play
22. Implement auto-play loop
23. Implement pause functionality
24. Add speed multiplier support
25. Test full execution

### Phase 7: Polish
26. Add all educational content
27. Add responsive CSS
28. Test edge cases
29. Verify smooth animations (60fps)
30. Final cross-browser testing

## Success Criteria

✅ Random binary tree generation (7-15 nodes)
✅ Clickable nodes to select BFS start point
✅ Step-by-step manual navigation (next/previous)
✅ Auto-play with speed control (0.25x to 2x)
✅ Queue state visualization (green boxes)
✅ Visit order numbers (1, 2, 3...) on nodes
✅ Level highlighting (orange border)
✅ Depth indicators in statistics panel
✅ Smooth animations following heap patterns
✅ Educational content explaining BFS
✅ Bootstrap styling throughout
✅ Responsive design for mobile
✅ Follows project guidelines (TypeScript, Bootstrap classes, no inline styles)
