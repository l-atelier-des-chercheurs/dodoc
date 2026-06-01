/**
 * Chain overflow handler for grid cells
 * Handles text overflow in chained grid cells by moving content to the next cell
 */

/**
 * Check if a cell has overflow
 * @param {HTMLElement} cell - The cell to check
 * @returns {boolean} - True if cell has overflow
 */
export function checkCellOverflow(cell) {
  const cellHeight = cell.clientHeight;
  const cellScrollHeight = cell.scrollHeight;
  // Use a small tolerance (2px) to account for rounding and sub-pixel rendering
  const hasOverflow = cellScrollHeight > cellHeight + 2;
  // console.log(`checkCellOverflow: height=${cellHeight}, scrollHeight=${cellScrollHeight}, overflow=${hasOverflow}`, cell);
  return hasOverflow;
}

/**
 * Safely get bounding client rect, handling cases where element might not be in DOM
 * @param {Element|Range} element - Element or Range to measure
 * @returns {DOMRect|null} - Bounding rect or null if not available
 */
export function safeGetBoundingClientRect(element) {
  if (!element) {
    return null;
  }

  // Range objects can always try getBoundingClientRect
  if (element instanceof Range) {
    try {
      return element.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }

  // For Node objects, check if they're in the DOM and visible
  if (element.nodeType !== undefined) {
    // Check if element is in the DOM
    if (element.isConnected === false) {
      return null;
    }

    // For elements, check visibility
    if (element.nodeType === Node.ELEMENT_NODE) {
      try {
        const style = window.getComputedStyle(element);
        if (style.display === "none") {
          return null;
        }
      } catch (e) {
        // Can't get computed style, might not be in DOM
        return null;
      }
    }
  }

  try {
    const rect = element.getBoundingClientRect();
    // Check if rect is valid (not all zeros, which might indicate element is not visible)
    if (
      rect.width === 0 &&
      rect.height === 0 &&
      rect.top === 0 &&
      rect.left === 0
    ) {
      // This might be a hidden element, but we'll still return it
      // as it could be a legitimate zero-size element
    }
    return rect;
  } catch (e) {
    // Element might not have offsetParent (not in layout)
    return null;
  }
}

/**
 * Find the cut-off point in a cell where content overflows
 * @param {HTMLElement} cell - The cell to check
 * @returns {{node: Text|null, offset: number}} - Cut-off point with text node and offset
 */
export function findCutOffPoint(cell) {
  const cellHeight = cell.clientHeight;
  const cellRect = safeGetBoundingClientRect(cell);
  if (!cellRect) {
    console.warn("findCutOffPoint: Could not get cell rect");
    return { node: null, offset: 0 };
  }
  const tolerance = 2;

  // Debug max bottom found
  let maxRelativeBottom = 0;

  // Use TreeWalker to get all text nodes and atomic elements in document order
  const walker = document.createTreeWalker(
    cell,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if atomic/replaced element
          const tagName = node.tagName.toLowerCase();
          const isReplaced = [
            "img",
            "video",
            "iframe",
            "canvas",
            "svg",
            "hr",
            "br",
          ].includes(tagName);
          if (isReplaced) return NodeFilter.FILTER_ACCEPT;
          // Skip script and style
          if (tagName === "script" || tagName === "style") {
            return NodeFilter.FILTER_REJECT;
          }
          // Visit children for containers
          return NodeFilter.FILTER_SKIP;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  // Walk through nodes
  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || text.trim().length === 0) {
        continue;
      }

      // Split text into words (keeping whitespace)
      const words = [];
      let pos = 0;
      const wordRegex = /\S+/g;
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        if (match.index > pos) {
          words.push({
            text: text.substring(pos, match.index),
            start: pos,
            end: match.index,
            isWord: false,
          });
        }
        words.push({
          text: match[0],
          start: match.index,
          end: match.index + match[0].length,
          isWord: true,
        });
        pos = match.index + match[0].length;
      }
      if (pos < text.length) {
        words.push({
          text: text.substring(pos),
          start: pos,
          end: text.length,
          isWord: false,
        });
      }

      // Check each word
      for (const word of words) {
        if (!word.isWord && word.text.trim().length === 0) {
          continue;
        }

        const testRange = document.createRange();
        try {
          testRange.setStart(node, word.start);
          testRange.setEnd(node, word.end);

          const rect = safeGetBoundingClientRect(testRange);

          if (!rect) {
            console.warn(
              "findCutOffPoint: Can't measure range, assuming cutoff"
            );
            testRange.detach();
            return { node: node, offset: word.start };
          }

          const relativeBottom = rect.bottom - cellRect.top;
          if (relativeBottom > maxRelativeBottom)
            maxRelativeBottom = relativeBottom;

          if (relativeBottom > cellHeight + tolerance) {
            console.log(
              `findCutOffPoint: Found cutoff at word: "${word.text}". Word bottom: ${relativeBottom}, Cell height: ${cellHeight}, Tolerance: ${tolerance}`
            );
            testRange.detach();
            return { node: node, offset: word.start };
          }
        } catch (e) {
          console.error("findCutOffPoint: Error measuring range", e);
          testRange.detach();
          return { node: node, offset: word.start };
        } finally {
          if (testRange) {
            testRange.detach();
          }
        }
      }
    } else {
      // Element node (Image, etc)
      const rect = safeGetBoundingClientRect(node);
      if (rect) {
        const relativeBottom = rect.bottom - cellRect.top;
        if (relativeBottom > maxRelativeBottom)
          maxRelativeBottom = relativeBottom;

        if (relativeBottom > cellHeight + tolerance) {
          console.log(
            `findCutOffPoint: Found cutoff at element <${node.tagName}>. Bottom: ${relativeBottom}, Cell height: ${cellHeight}`
          );
          return { node: node, offset: 0 };
        }
      }
    }
  }

  // No cut-off point found (all content is visible)
  console.log(
    `findCutOffPoint: No cutoff found. Max text bottom: ${maxRelativeBottom}, Cell height: ${cellHeight}, ScrollHeight: ${cell.scrollHeight}`
  );
  return { node: null, offset: 0 };
}

/**
 * Split DOM tree at textNode/offset and collect the right-hand side nodes
 * @param {HTMLElement} container
 * @param {Node} startNode
 * @param {number} offset
 */
function splitAndCollectNodes(container, startNode, offset) {
  const nodesToMove = [];

  // 1. Determine the node to move
  let nodeToMove;
  if (startNode.nodeType === Node.TEXT_NODE) {
    if (offset < startNode.textContent.length) {
      nodeToMove = startNode.splitText(offset);
    } else {
      // Offset at end, nothing to split in this node,
      // but we might need to split parents if there are siblings after
      nodeToMove = startNode.splitText(offset); // returns empty text node
    }
  } else {
    // It's an element, move the whole element
    nodeToMove = startNode;
  }

  // 2. Walk up and split parents
  let currentRight = nodeToMove;
  let parent = currentRight.parentNode;

  while (parent && parent !== container) {
    // Create split parent (shallow clone)
    const rightParent = parent.cloneNode(false);
    if (rightParent.id) rightParent.removeAttribute("id"); // Remove ID to avoid duplicates

    // Move currentRight and all subsequent siblings to rightParent
    let sibling = currentRight;
    while (sibling) {
      const next = sibling.nextSibling;
      rightParent.appendChild(sibling);
      sibling = next;
    }

    // Insert rightParent into grandparent, after parent
    if (parent.parentNode) {
      parent.parentNode.insertBefore(rightParent, parent.nextSibling);
    }

    currentRight = rightParent;
    parent = parent.parentNode;
  }

  // At this point, parent === container.
  // currentRight is the root of the right-side tree (direct child of container).
  // It is already inserted in container after currentLeft.

  // Now collect currentRight and all its following siblings in container.
  let node = currentRight;
  while (node) {
    nodesToMove.push(node);
    node = node.nextSibling;
  }

  return nodesToMove;
}

// Clean up empty nodes in the path from startNode up to container
function cleanupEmptyPath(startNode, container) {
  let current = startNode;
  while (current && current !== container) {
    const parent = current.parentNode;

    // Check if node is effectively empty
    let isEmpty = false;
    if (current.nodeType === Node.TEXT_NODE) {
      isEmpty = current.textContent.length === 0;
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      // It's empty if it has no children, OR if all children are empty text nodes
      if (current.childNodes.length === 0) {
        isEmpty = true;
      } else {
        const hasContent = Array.from(current.childNodes).some((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent.trim().length > 0;
          }
          return true; // Assume other elements have content
        });
        isEmpty = !hasContent;
      }
    }

    if (isEmpty) {
      current.remove();
    } else {
      // If not empty, parent won't be empty either (it contains current)
      break;
    }
    current = parent;
  }
}

/**
 * Move overflow content from current cell to next cell
 * @param {HTMLElement} currentCell - Cell with overflow
 * @param {HTMLElement} nextCell - Next cell in chain to receive overflow
 * @returns {boolean} - True if content was moved successfully
 */
export function moveOverflowToNextCell(currentCell, nextCell) {
  console.log("moveOverflowToNextCell start", { currentCell, nextCell });
  const cutOffPoint = findCutOffPoint(currentCell);

  if (!cutOffPoint.node) {
    console.log("moveOverflowToNextCell: No cut-off point found");
    return false;
  }

  const startNode = cutOffPoint.node;
  const offset = cutOffPoint.offset;

  if (startNode.nodeType === Node.TEXT_NODE) {
    console.log(
      `moveOverflowToNextCell: Found cut-off at offset ${offset} in text: "${startNode.textContent.substring(
        0,
        20
      )}..."`
    );
  } else {
    console.log(
      `moveOverflowToNextCell: Found cut-off at element <${startNode.tagName}>`
    );
  }

  // Capture parent for cleanup if startNode moves entirely
  let cleanupNode = startNode;
  if (startNode.nodeType !== Node.TEXT_NODE) {
    cleanupNode = startNode.parentNode;
  }

  // Split DOM and collect nodes to move
  const nodesToMove = splitAndCollectNodes(currentCell, startNode, offset);

  // Move nodes to next cell
  if (nodesToMove.length > 0) {
    console.log(
      `moveOverflowToNextCell: Moving ${nodesToMove.length} nodes to next cell`
    );

    // Create fragment and move nodes
    const fragment = document.createDocumentFragment();
    nodesToMove.forEach((node) => {
      // Only move if node is still in the DOM and part of currentCell (it should be)
      if (node.parentNode && currentCell.contains(node)) {
        fragment.appendChild(node);
      }
    });

    // Cleanup empty nodes left behind in currentCell
    if (startNode.nodeType === Node.TEXT_NODE) {
      cleanupEmptyPath(startNode, currentCell);
    } else {
      // If we moved an element, startNode is gone. Check its original parent.
      if (cleanupNode && currentCell.contains(cleanupNode)) {
        cleanupEmptyPath(cleanupNode, currentCell);
      }
    }

    // Clear any existing overflow warning from next cell
    const existingWarning = nextCell.querySelector("._textOverflowWarning");
    if (existingWarning) {
      existingWarning.remove();
    }
    nextCell.classList.remove("has--textOverflow");

    // If fragment has children, add them to next cell
    if (fragment.hasChildNodes()) {
      // If next cell is empty or only has whitespace, replace content
      const nextCellText = nextCell.textContent?.trim() || "";
      if (nextCellText.length === 0) {
        nextCell.innerHTML = "";
        nextCell.appendChild(fragment);
      } else {
        // Prepend to existing content
        const firstChild = nextCell.firstChild;
        if (firstChild) {
          nextCell.insertBefore(fragment, firstChild);
        } else {
          nextCell.appendChild(fragment);
        }
      }

      return true;
    }
  }

  return false;
}

/**
 * Show overflow warning on a cell
 * @param {HTMLElement} cell - Cell to show warning on
 * @param {string} warningText - Translated warning text to display
 */
export function showOverflowWarning(cell, warningText) {
  // Remove existing warning if any
  const existingWarning = cell.querySelector("._textOverflowWarning");
  if (existingWarning) {
    return; // Warning already exists
  }

  cell.classList.add("has--textOverflow");

  const warning = document.createElement("div");
  warning.className = "_textOverflowWarning";
  const warning_text = document.createElement("span");
  warning_text.className = "u-warning";
  warning_text.textContent = warningText;
  warning.appendChild(warning_text);
  cell.appendChild(warning);
}

/**
 * Handle overflow in a chain of cells
 * @param {HTMLElement} cell - Starting cell in the chain
 * @param {HTMLElement} page - Page element to search for chain cells within (only cells on this page)
 * @param {string} warningText - Translated warning text to display
 */
export function handleChainOverflow(cell, page, warningText) {
  const cell_id = cell.getAttribute("data-grid-area-id");
  // Only search for chain cells within the same page
  const chain_cells = page.querySelectorAll(
    `.grid-cell[data-grid-area-id="${cell_id}"][data-grid-area-is-chain-index]`
  );
  const chain_cells_array = Array.from(chain_cells);

  if (chain_cells_array.length === 0) return;

  // sort chain cells by data-grid-area-is-chain-index ascending
  chain_cells_array.sort((a, b) => {
    const a_index = parseInt(a.getAttribute("data-grid-area-is-chain-index"));
    const b_index = parseInt(b.getAttribute("data-grid-area-is-chain-index"));
    return a_index - b_index;
  });

  // Process each cell in the chain
  // Use a safety counter to prevent infinite loops
  let maxIterations = chain_cells_array.length * 10; // Allow multiple passes
  let iterationCount = 0;

  for (
    let i = 0;
    i < chain_cells_array.length && iterationCount < maxIterations;
    i++
  ) {
    iterationCount++;
    const currentCell = chain_cells_array[i];

    // Check if current cell has overflow
    const hasOverflow = checkCellOverflow(currentCell);

    if (!hasOverflow) {
      continue; // No overflow, move to next cell
    }

    // Find the next cell in the chain
    const nextCell = chain_cells_array[i + 1];

    if (!nextCell) {
      // No next cell available, show overflow warning
      showOverflowWarning(currentCell, warningText);
      break;
    }

    // Find the cut-off point and move overflow content to next cell
    const moved = moveOverflowToNextCell(currentCell, nextCell);

    if (!moved) {
      // Couldn't move content (might be empty or unbreakable)
      showOverflowWarning(currentCell, warningText);
      break;
    }

    // Restart from the beginning to check all cells again
    // This handles cascading overflow
    i = -1; // Will be incremented to 0 in next iteration
  }
}
