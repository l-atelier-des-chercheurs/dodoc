// Imposition for booklet(s)
//
// This script re-arrange the pages of your document in order to make an imposed sheet layouts for printing.
// Two pages per sheet, double-sided

export default function (Handler, registerHandlers) {
  class Booklet extends Handler {
    constructor(chunker, polisher, caller) {
      super(chunker, polisher, caller);
      this.pagedbooklet;
      this.sourceSize;
      this.pageStart;
      this.pageEnd;
    }
    onAtPage(node, item, list) {}
    onDeclaration(declaration, dItem, dList, rule) {
      if (declaration.property == "--paged-layout") {
        if (declaration.value.value.includes("booklet")) {
          this.pagedbooklet = true;
          let valuesBooklet = declaration.value.value.split(" ");
          let index = valuesBooklet.indexOf("booklet");

          /* Set first page of the imposition */
          if (valuesBooklet[index + 1]) {
            this.pageStart = parseInt(valuesBooklet[index + 1]);
          } else {
            this.pageStart = 1;
          }

          /* Set ladt page of the imposition */
          if (valuesBooklet[index + 2]) {
            this.pageEnd = parseInt(valuesBooklet[index + 2]);
          }
        }
      }
    }
    afterRendered(pages) {
      /* Verify this.pageEnd */
      if (!this.pageEnd) {
        let allPagesBefore = document.querySelectorAll(".pagedjs_page").length;
        this.pageEnd = allPagesBefore;
      }

      /* Verify this.pageStart */
      if (this.pageStart == 0) {
        this.pageStart = 1;
      } else if (this.pageStart % 2 == 0) {
        this.pageStart = this.pageStart - 1;
      }

      /* Launch when printing */
      window.addEventListener("beforeprint", (evenement) => {
        let containerPages = document.querySelector(".pagedjs_pages");

        /* Delete pages we don't want*/
        pages.forEach((page) => {
          let id = parseInt(page.id.replace("page-", ""));
          if (id < this.pageStart || id > this.pageEnd) {
            let pageSelect = document.querySelector("#" + page.id);
            pageSelect.remove();
          }
        });

        /* Reset page counter */
        let reset = parseInt(this.pageStart) - 1;
        containerPages.style.counterReset = "page " + reset;

        let format = document.querySelector(".pagedjs_page");

        /* Width of page without bleed, extract the first number of calc() function */
        let width = getCSSCustomProp("--pagedjs-width", format);
        let numbers = width.match(/[0-9]+/g).map(function (n) {
          return +n;
        });
        width = parseInt(numbers[0]);

        /* Height of page with bleed, addition of all the numbers of calc() function*/
        let height = getCSSCustomProp("--pagedjs-height", format);
        numbers = height.match(/[0-9]+/g).map(function (n) {
          return +n;
        });
        const reducer = (previousValue, currentValue) =>
          previousValue + currentValue;
        height = numbers.reduce(reducer);

        /* Bleed of the page */
        let bleed = getCSSCustomProp("--pagedjs-bleed-top", format);
        let bleedNum = parseInt(bleed);

        /* Spread and half-spread*/
        let spread = width * 2 + bleedNum * 2;

        let spreadHalf = width + bleedNum;

        // Add CSS to have pages in spread
        //
        // - change size of the page when printing (actually, sheet size)
        // - flex properties
        // - delete bleeds inside spread */

        var newSize = `@media print{
                  @page{
                    size:  ${spread}mm ${height}mm;
                  }
                  .pagedjs_pages {
                    width: auto;
                  }
                }
                @media screen{
                  .pagedjs_pages{
                    max-width: calc(var(--pagedjs-width) * 2);
                  }
                }
                .pagedjs_pages {
                  display: flex !important;
                  flex-wrap: wrap;
                  transform: none !important;
                  height: 100% !important;
                  min-height: 100%;
                  max-height: 100%;
                  overflow: visible;
                }
                
                .pagedjs_page {
                  margin: 0;
                  padding: 0;
                  max-height: 100%;
                  min-height: 100%;
                  height: 100% !important;

                }

                .pagedjs_sheet {
                  margin: 0;
                  padding: 0;
                  max-height: 100%;
                  min-height: 100%;
                  height: 100% !important;
                } 
                body{
                  --pagedjs-bleed-right-left: 0mm;
                }
                .pagedjs_left_page{
                  z-index: 20;
                  width: calc(var(--pagedjs-bleed-left) + var(--pagedjs-pagebox-width))!important;
                }
                
                .pagedjs_left_page .pagedjs_bleed-right .pagedjs_marks-crop {
                  border-color: transparent;
                }
                
                .pagedjs_right_page,
                .pagedjs_right_page .pagedjs_sheet{
                  width: calc(var(--pagedjs-bleed-right-right) + var(--pagedjs-pagebox-width))!important;
                }
                
                .pagedjs_right_page .pagedjs_sheet{
                  grid-template-columns: [bleed-left] var(--pagedjs-bleed-right-left) [sheet-center] 1fr [bleed-right] var(--pagedjs-bleed-right-right);
                }
                .pagedjs_right_page .pagedjs_bleed-left{
                  display: none;
                }
                
                .pagedjs_right_page .pagedjs_bleed-top .pagedjs_marks-crop:nth-child(1), 
                .pagedjs_right_page .pagedjs_bleed-bottom .pagedjs_marks-crop:nth-child(1){
                  width: 0!important;
                }
                .pagedjs_first_page {
                        margin-left: 0;
                }
                body{
                    margin: 0
                }
                .pagedjs_page:nth-of-type(even){
                  break-after: always;
                }
                .pagedjs_page,
                .pagedjs_sheet{
                  width: ${spreadHalf - 0.1}mm!important;
                }
                
                `;

        // Add style for the arrangement of the pages

        if (this.pagedbooklet == true) {
          let style = document.createElement("style");
          style.textContent = newSize;
          document.head.appendChild(style);

          var number_of_pages =
            document.getElementsByClassName("pagedjs_page").length;
          var pages_array = [];

          // If the page count isn't a multiple of 4, we need to pad the array with blank
          // pages so we have the correct number of pages for a booklet.
          //
          // ex. [1, 2, 3, 4, 5, 6, 7, 8, 9, blank, blank, blank]

          let modulo = number_of_pages % 4;
          let additional_pages = 0;
          if (modulo != 0) {
            additional_pages = 4 - modulo;
          }

          for (i = 0; i < additional_pages; i++) {
            let added_page = document.createElement("div");
            added_page.classList.add("pagedjs_page", "added");
            added_page.id = `page-${this.pageEnd + i + 1}`;
            document.querySelector(".pagedjs_pages").appendChild(added_page);
          }

          // Push each page in the array

          for (var i = number_of_pages + additional_pages; i >= 1; i--) {
            pages_array.push(i);
          }

          // Split the array in half
          //
          // ex. [1, 2, 3, 4, 5, 6], [7, 8, 9, blank, blank, blank]

          var split_start = pages_array.length / 2;

          var split_end = pages_array.length;

          var first_array = pages_array.slice(0, split_start);
          var second_array = pages_array.slice(split_start, split_end);

          // Reverse the second half of the array. This is the beginning of the back half
          // of the booklet (from the center fold, back to the outside last page)
          //
          // ex. [blank, blank, blank, 9, 8, 7]

          var second_array_reversed = second_array.reverse();

          // Zip the two arrays together in groups of 2 These will end up being each '2-up
          // side' of the final document So, the sub-array at index zero will be the first
          // side of physical page one and index 1 will be the back side. However, they
          // won't yet be in the proper order.
          //
          // ex. [[1, blank], [2, blank], [3, blank], [4, 9], [5, 8], [6, 7]]

          var page_groups = [];
          for (var i = 0; i < first_array.length; i++) {
            page_groups[i] = [first_array[i], second_array_reversed[i]];
          }

          // We need to reverse every other sub-array starting with the first side. This
          // is the final step of aligning our booklet pages in the order with which the
          // booklet gets printed and bound.
          //
          // ex. [[blank, 1], [2, blank], [blank, 3], [4, 9], [8, 5], [6, 7]] final_groups
          // = page_groups.each_with_index { |group, index| group.reverse! if (index %
          // 2).zero? }
          var final_groups = [];
          for (var i = 0; i < page_groups.length; i++) {
            var group = page_groups[i];
            if (i % 2 != 0) {
              final_groups[i] = page_groups[i].reverse();
            } else {
              final_groups[i] = page_groups[i];
            }
          }
          console.log("Final Imposition Order: " + final_groups);

          var allPages = document.querySelectorAll(".pagedjs_page");

          var final_flat = final_groups.flat();

          final_flat.forEach((folio, i) => {
            folio = folio + reset;
            document.querySelector(`#page-${folio}`).style.order = i;
          });
        }
      }); // before print
    }
  }
  registerHandlers(Booklet);
  /**
   * Pass in an element and its CSS Custom Property that you want the value of.
   * Optionally, you can determine what datatype you get back.
   *
   * @param {String} propKey
   * @param {HTMLELement} element=document.documentElement
   * @param {String} castAs='string'
   * @returns {*}
   */
  const getCSSCustomProp = (
    propKey,
    element = document.documentElement,
    castAs = "string"
  ) => {
    let response = getComputedStyle(element).getPropertyValue(propKey);

    // Tidy up the string if there's something to work with
    if (response.length) {
      response = response.replace(/\'|"/g, "").trim();
    }

    // Convert the response into a whatever type we wanted
    switch (castAs) {
      case "number":
      case "int":
        return parseInt(response, 10);
      case "float":
        return parseFloat(response, 10);
      case "boolean":
      case "bool":
        return response === "true" || response === "1";
    }

    // Return the string response by default
    return response;
  };
}
