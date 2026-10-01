/**
 * Chain overflow handler for grid cells.
 * Flows overflowing text A → A1 → A2; only the last cell may show a warning.
 */

export const OVERFLOW_TOLERANCE_PX = 2;
const FALSE_POSITIVE_SLACK_PX = 8;
const REPLACED_TAGS = new Set([
  "img",
  "video",
  "iframe",
  "canvas",
  "svg",
  "hr",
  "br",
]);

export function checkCellOverflow(cell, slack = OVERFLOW_TOLERANCE_PX) {
  if (!cell) return false;
  return cell.scrollHeight > cell.clientHeight + slack;
}

export function getChainIndex(cell) {
  const raw = cell?.getAttribute("data-grid-area-is-chain-index");
  const index = parseInt(raw, 10);
  return Number.isNaN(index) ? 0 : index;
}

export function sortChainCells(cells) {
  return [...cells].sort((a, b) => getChainIndex(a) - getChainIndex(b));
}

function isOverflowWarning(node) {
  return (
    node?.nodeType === Node.ELEMENT_NODE &&
    node.classList?.contains("_textOverflowWarning")
  );
}

function getMovableChildNodes(cell) {
  return Array.from(cell.childNodes).filter((node) => {
    if (isOverflowWarning(node)) return false;
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim().length > 0;
    }
    return node.nodeType === Node.ELEMENT_NODE;
  });
}

export function safeGetBoundingClientRect(element) {
  if (!element) {
    return null;
  }

  if (element instanceof Range) {
    try {
      return element.getBoundingClientRect();
    } catch (e) {
      return null;
    }
  }

  if (element.nodeType !== undefined) {
    if (element.isConnected === false) {
      return null;
    }

    if (element.nodeType === Node.ELEMENT_NODE) {
      try {
        const style = window.getComputedStyle(element);
        if (style.display === "none") {
          return null;
        }
      } catch (e) {
        return null;
      }
    }
  }

  try {
    return element.getBoundingClientRect();
  } catch (e) {
    return null;
  }
}

function targetExceedsCell(target, cellRect, cellHeight, tolerance) {
  let rects = [];
  try {
    if (typeof target.getClientRects === "function") {
      rects = Array.from(target.getClientRects());
    }
  } catch (e) {
    rects = [];
  }
  if (rects.length === 0) {
    const rect = safeGetBoundingClientRect(target);
    if (rect) rects = [rect];
  }

  return rects.some((rect) => rect.bottom - cellRect.top > cellHeight + tolerance);
}

function acceptCutOffNode(node) {
  if (isOverflowWarning(node)) return NodeFilter.FILTER_REJECT;
  if (node.nodeType !== Node.ELEMENT_NODE) return NodeFilter.FILTER_ACCEPT;

  const tagName = node.tagName.toLowerCase();
  if (REPLACED_TAGS.has(tagName)) return NodeFilter.FILTER_ACCEPT;
  if (tagName === "script" || tagName === "style") {
    return NodeFilter.FILTER_REJECT;
  }
  return NodeFilter.FILTER_SKIP;
}

function findCutOffViaCaret(cell, cellRect) {
  const x = cellRect.left + Math.min(8, Math.max(1, cellRect.width / 2));
  const y = cellRect.bottom - 1;

  let node;
  let offset = 0;
  try {
    if (typeof document.caretPositionFromPoint === "function") {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        node = pos.offsetNode;
        offset = pos.offset;
      }
    } else if (typeof document.caretRangeFromPoint === "function") {
      const range = document.caretRangeFromPoint(x, y);
      if (range) {
        node = range.startContainer;
        offset = range.startOffset;
      }
    }
  } catch (e) {
    return null;
  }

  if (!node || !cell.contains(node)) return null;

  const remainder = document.createRange();
  try {
    remainder.setStart(node, offset);
    remainder.setEnd(cell, cell.childNodes.length);
  } catch (e) {
    return null;
  }

  const remainder_text = remainder.toString().trim();
  let has_replaced = false;
  try {
    has_replaced = Boolean(
      remainder.cloneContents().querySelector("img, video, iframe, canvas, svg, hr")
    );
  } catch (e) {
    has_replaced = false;
  }

  if (!remainder_text && !has_replaced) return null;
  return { node, offset };
}

function findFirstOverflowingChild(cell, cellRect, cellHeight, tolerance) {
  for (const child of getMovableChildNodes(cell)) {
    if (targetExceedsCell(child, cellRect, cellHeight, tolerance)) {
      return child;
    }
  }
  return null;
}

/**
 * Find the cut-off point in a cell where content overflows
 * @param {HTMLElement} cell
 * @returns {{node: Node|null, offset: number}}
 */
export function findCutOffPoint(cell) {
  const cellHeight = cell.clientHeight;
  const cellRect = safeGetBoundingClientRect(cell);
  if (!cellRect) {
    return { node: null, offset: 0 };
  }

  const walker = document.createTreeWalker(
    cell,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    { acceptNode: acceptCutOffNode }
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (!text || text.trim().length === 0) {
        continue;
      }

      const words = [];
      let pos = 0;
      const wordRegex = /\S+/g;
      let match;

      while ((match = wordRegex.exec(text)) !== null) {
        if (match.index > pos) {
          words.push({
            start: pos,
            end: match.index,
            isWord: false,
          });
        }
        words.push({
          start: match.index,
          end: match.index + match[0].length,
          isWord: true,
        });
        pos = match.index + match[0].length;
      }
      if (pos < text.length) {
        words.push({ start: pos, end: text.length, isWord: false });
      }

      for (const word of words) {
        if (!word.isWord) continue;

        const testRange = document.createRange();
        try {
          testRange.setStart(node, word.start);
          testRange.setEnd(node, word.end);
          if (
            targetExceedsCell(
              testRange,
              cellRect,
              cellHeight,
              OVERFLOW_TOLERANCE_PX
            )
          ) {
            return { node, offset: word.start };
          }
        } catch (e) {
          return { node, offset: word.start };
        } finally {
          try {
            testRange.detach();
          } catch (err) {
            /* Range.detach is a no-op in modern browsers */
          }
        }
      }
    } else if (
      targetExceedsCell(node, cellRect, cellHeight, OVERFLOW_TOLERANCE_PX)
    ) {
      return { node, offset: 0 };
    }
  }

  const caret_cut = findCutOffViaCaret(cell, cellRect);
  if (caret_cut) return caret_cut;

  const overflowing_child = findFirstOverflowingChild(
    cell,
    cellRect,
    cellHeight,
    OVERFLOW_TOLERANCE_PX
  );
  if (overflowing_child) {
    return { node: overflowing_child, offset: 0 };
  }

  return { node: null, offset: 0 };
}

function splitAndCollectNodes(container, startNode, offset) {
  const nodesToMove = [];

  let nodeToMove;
  if (startNode.nodeType === Node.TEXT_NODE) {
    nodeToMove = startNode.splitText(offset);
  } else {
    nodeToMove = startNode;
  }

  let currentRight = nodeToMove;
  let parent = currentRight.parentNode;

  while (parent && parent !== container) {
    const rightParent = parent.cloneNode(false);
    if (rightParent.id) rightParent.removeAttribute("id");

    let sibling = currentRight;
    while (sibling) {
      const next = sibling.nextSibling;
      rightParent.appendChild(sibling);
      sibling = next;
    }

    if (parent.parentNode) {
      parent.parentNode.insertBefore(rightParent, parent.nextSibling);
    }

    currentRight = rightParent;
    parent = parent.parentNode;
  }

  let node = currentRight;
  while (node) {
    nodesToMove.push(node);
    node = node.nextSibling;
  }

  return nodesToMove;
}

function cleanupEmptyPath(startNode, container) {
  let current = startNode;
  while (current && current !== container) {
    const parent = current.parentNode;

    let isEmpty = false;
    if (current.nodeType === Node.TEXT_NODE) {
      isEmpty = current.textContent.length === 0;
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      if (isOverflowWarning(current)) {
        break;
      }
      if (current.childNodes.length === 0) {
        isEmpty = true;
      } else {
        const hasContent = Array.from(current.childNodes).some((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            return child.textContent.trim().length > 0;
          }
          return !isOverflowWarning(child);
        });
        isEmpty = !hasContent;
      }
    }

    if (isEmpty) {
      current.remove();
    } else {
      break;
    }
    current = parent;
  }
}

function prependFragmentToCell(nextCell, fragment) {
  clearOverflowWarning(nextCell);

  if (!fragment.hasChildNodes()) return false;

  const nextCellText = nextCell.textContent?.trim() || "";
  if (nextCellText.length === 0) {
    nextCell.innerHTML = "";
    nextCell.appendChild(fragment);
  } else {
    const firstChild = nextCell.firstChild;
    if (firstChild) {
      nextCell.insertBefore(fragment, firstChild);
    } else {
      nextCell.appendChild(fragment);
    }
  }
  return true;
}

function moveCollectedNodes(currentCell, nodesToMove, nextCell, cleanupNode) {
  if (!nodesToMove.length) return false;

  const fragment = document.createDocumentFragment();
  nodesToMove.forEach((node) => {
    if (node.parentNode && currentCell.contains(node)) {
      fragment.appendChild(node);
    }
  });

  if (cleanupNode && currentCell.contains(cleanupNode)) {
    cleanupEmptyPath(cleanupNode, currentCell);
  }

  return prependFragmentToCell(nextCell, fragment);
}

export function moveOverflowToNextCell(currentCell, nextCell) {
  const cutOffPoint = findCutOffPoint(currentCell);

  if (!cutOffPoint.node) {
    return false;
  }

  const startNode = cutOffPoint.node;
  const offset = cutOffPoint.offset;
  let cleanupNode = startNode;
  if (startNode.nodeType !== Node.TEXT_NODE) {
    cleanupNode = startNode.parentNode;
  }

  const nodesToMove = splitAndCollectNodes(currentCell, startNode, offset);
  return moveCollectedNodes(currentCell, nodesToMove, nextCell, cleanupNode);
}

/**
 * When word-level splitting cannot find a cut, move the first overflowing
 * block (or the last block if layout APIs are inconclusive) to the next cell.
 */
export function moveOverflowingTailToNextCell(currentCell, nextCell) {
  const children = getMovableChildNodes(currentCell);
  if (children.length === 0) return false;

  const overflow_amount = currentCell.scrollHeight - currentCell.clientHeight;
  const cellRect = safeGetBoundingClientRect(currentCell);
  const overflowing_child =
    cellRect &&
    findFirstOverflowingChild(
      currentCell,
      cellRect,
      currentCell.clientHeight,
      OVERFLOW_TOLERANCE_PX
    );

  if (
    !overflowing_child &&
    overflow_amount <= FALSE_POSITIVE_SLACK_PX
  ) {
    return false;
  }

  const start_node = overflowing_child || children[children.length - 1];
  const cleanupNode =
    start_node.nodeType === Node.TEXT_NODE
      ? start_node
      : start_node.parentNode;
  const nodesToMove = splitAndCollectNodes(currentCell, start_node, 0);
  return moveCollectedNodes(currentCell, nodesToMove, nextCell, cleanupNode);
}

export function clearOverflowWarning(cell) {
  if (!cell) return;
  cell.querySelectorAll("._textOverflowWarning").forEach((el) => el.remove());
  cell.classList.remove("has--textOverflow");
}

export function showOverflowWarning(cell, warningText) {
  if (!cell) return;
  if (cell.querySelector("._textOverflowWarning")) {
    cell.classList.add("has--textOverflow");
    return;
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
 * Flow overflow along a chain. Intermediate cells never get a warning.
 */
export function flowContentThroughChain(
  cells,
  {
    last_cell_warning_text = "Text Overflow",
    check_overflow = checkCellOverflow,
    move_overflow = moveOverflowToNextCell,
    move_overflow_tail = moveOverflowingTailToNextCell,
  } = {}
) {
  const ordered = sortChainCells(cells);
  if (ordered.length === 0) return ordered;

  ordered.forEach(clearOverflowWarning);

  const max_moves_per_cell = Math.max(ordered.length * 10, 20);

  for (let i = 0; i < ordered.length - 1; i++) {
    const current_cell = ordered[i];
    const next_cell = ordered[i + 1];
    let move_count = 0;

    while (
      check_overflow(current_cell) &&
      move_count < max_moves_per_cell
    ) {
      move_count++;
      let moved = move_overflow(current_cell, next_cell);
      if (!moved) {
        moved = move_overflow_tail(current_cell, next_cell);
      }
      if (!moved) break;
    }

    clearOverflowWarning(current_cell);
  }

  const last_cell = ordered[ordered.length - 1];
  if (check_overflow(last_cell)) {
    showOverflowWarning(last_cell, last_cell_warning_text);
  } else {
    clearOverflowWarning(last_cell);
  }

  return ordered;
}

export function handleChainOverflow(cell, page, warningText) {
  const cell_id = cell.getAttribute("data-grid-area-id");
  const chain_cells = page.querySelectorAll(
    `.grid-cell[data-grid-area-id="${cell_id}"][data-grid-area-is-chain-index]`
  );
  flowContentThroughChain(Array.from(chain_cells), {
    last_cell_warning_text: warningText,
  });
}
