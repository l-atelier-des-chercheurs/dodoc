import { describe, it, expect } from "vitest";
import {
  clearOverflowWarning,
  flowContentThroughChain,
  getChainIndex,
  showOverflowWarning,
  sortChainCells,
} from "../chainOverflowHandler.js";

function makeCell({ index, html = "<p>text</p>" } = {}) {
  const cell = document.createElement("div");
  cell.className = "grid-cell";
  cell.setAttribute("data-grid-area-id", "A");
  cell.setAttribute("data-grid-area-is-chain-index", String(index));
  cell.innerHTML = html;
  document.body.appendChild(cell);
  return cell;
}

describe("chain overflow flow", () => {
  it("sorts cells by chain index", () => {
    const a2 = makeCell({ index: 2 });
    const a0 = makeCell({ index: 0 });
    const a1 = makeCell({ index: 1 });
    expect(sortChainCells([a2, a0, a1]).map(getChainIndex)).toEqual([0, 1, 2]);
    a2.remove();
    a0.remove();
    a1.remove();
  });

  it("does not mark intermediate cells when a split cannot move content", () => {
    const a = makeCell({ index: 0 });
    const a1 = makeCell({ index: 1 });
    const a2 = makeCell({ index: 2 });

    const overflow_ids = new Set(["A-1"]);
    flowContentThroughChain([a, a1, a2], {
      check_overflow: (cell) =>
        overflow_ids.has(`A-${cell.getAttribute("data-grid-area-is-chain-index")}`),
      move_overflow: () => false,
      move_overflow_tail: () => false,
    });

    expect(a.classList.contains("has--textOverflow")).toBe(false);
    expect(a1.classList.contains("has--textOverflow")).toBe(false);
    expect(a2.classList.contains("has--textOverflow")).toBe(false);
    expect(a1.querySelector("._textOverflowWarning")).toBeNull();

    a.remove();
    a1.remove();
    a2.remove();
  });

  it("marks only the last cell when it still overflows after flowing", () => {
    const a = makeCell({ index: 0 });
    const a1 = makeCell({ index: 1 });
    const a2 = makeCell({ index: 2 });

    flowContentThroughChain([a, a1, a2], {
      check_overflow: (cell) =>
        cell.getAttribute("data-grid-area-is-chain-index") === "2",
      move_overflow: () => false,
      move_overflow_tail: () => false,
    });

    expect(a.classList.contains("has--textOverflow")).toBe(false);
    expect(a1.classList.contains("has--textOverflow")).toBe(false);
    expect(a2.classList.contains("has--textOverflow")).toBe(true);
    expect(a2.querySelector("._textOverflowWarning")?.textContent).toBe(
      "Text Overflow"
    );

    a.remove();
    a1.remove();
    a2.remove();
  });

  it("keeps pumping overflow into the next cell until the current one fits", () => {
    const a = makeCell({ index: 0 });
    const a1 = makeCell({ index: 1 });
    const remaining = { A0: 2, A1: 0 };

    flowContentThroughChain([a, a1], {
      check_overflow: (cell) => {
        const key =
          cell.getAttribute("data-grid-area-is-chain-index") === "0"
            ? "A0"
            : "A1";
        return remaining[key] > 0;
      },
      move_overflow: (current) => {
        if (current.getAttribute("data-grid-area-is-chain-index") !== "0") {
          return false;
        }
        remaining.A0 -= 1;
        remaining.A1 += 1;
        return true;
      },
      move_overflow_tail: () => false,
    });

    expect(remaining.A0).toBe(0);
    expect(a.classList.contains("has--textOverflow")).toBe(false);
    expect(a1.classList.contains("has--textOverflow")).toBe(true);

    a.remove();
    a1.remove();
  });

  it("clears a previous warning on an intermediate cell", () => {
    const a1 = makeCell({ index: 1 });
    const a2 = makeCell({ index: 2 });
    showOverflowWarning(a1, "Text Overflow (Blocker)");
    expect(a1.classList.contains("has--textOverflow")).toBe(true);

    flowContentThroughChain([a1, a2], {
      check_overflow: () => false,
      move_overflow: () => false,
      move_overflow_tail: () => false,
    });

    expect(a1.classList.contains("has--textOverflow")).toBe(false);
    expect(a1.querySelector("._textOverflowWarning")).toBeNull();

    a1.remove();
    a2.remove();
  });

  it("clearOverflowWarning removes the marker class and node", () => {
    const cell = makeCell({ index: 0 });
    showOverflowWarning(cell, "Text Overflow");
    clearOverflowWarning(cell);
    expect(cell.classList.contains("has--textOverflow")).toBe(false);
    expect(cell.querySelector("._textOverflowWarning")).toBeNull();
    cell.remove();
  });
});
