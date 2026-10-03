import { Handler } from "pagedjs";
import { flowContentThroughChain } from "./chainOverflowHandler.js";

export class PagedjsFlowHandler extends Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  afterPreview(pages) {
    this.handleAllChains(pages);
  }

  handleAllChains(pages) {
    pages.forEach((page) => {
      const pageElement = page.element;
      const cells = pageElement.querySelectorAll(
        ".grid-cell[data-grid-area-is-chain-index]"
      );

      const chains = {};
      cells.forEach((cell) => {
        const chainId = cell.getAttribute("data-grid-area-id");
        const chain_index_attr = cell.getAttribute(
          "data-grid-area-is-chain-index"
        );
        if (!chainId || chain_index_attr === null) return;

        if (!chains[chainId]) {
          chains[chainId] = [];
        }
        chains[chainId].push(cell);
      });

      Object.keys(chains).forEach((chainId) => {
        flowContentThroughChain(chains[chainId]);
      });
    });
  }
}
