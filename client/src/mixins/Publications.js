export default {
  computed: {},
  methods: {
    calculateZoomToFit({
      width,
      height,
      desired_largest_dimension,
      magnification,
    }) {
      const largest_dimension = Math.max(width, height);
      return desired_largest_dimension / (largest_dimension * magnification);
    },
    getModulesForPage({ modules, page_id }) {
      return (
        modules
          .filter((f) => f.page_id === page_id)
          .sort(
            (a, b) => +new Date(b.$date_uploaded) - +new Date(a.$date_uploaded)
          ) || []
      ).reverse();
    },
    setPaginationFromPublication(publication) {
      if (publication.enable_pagination !== true) return false;
      return {
        right: publication.pagn_right || 2,
        bottom: publication.pagn_bottom || 2,
        pagination_start_on_page: publication.pagn_starts_on_page - 1 || 0,
      };
    },
    makeSpread({ pages }) {
      // turn pages array into [[{id:""}, {id:""}], [{id:""}, {id:""}], [{id:""}, {id:""}], …]
      const number_of_spreads = Math.floor(pages.length / 2 + 1);
      let spreads = [];
      let index = 0;

      for (let i = 0; i < number_of_spreads; i++) {
        if (spreads.length === 0) {
          spreads.push([false, pages[index]]);
          index += 1;
        } else {
          const left_page = pages[index];
          const right_page =
            index + 1 < pages.length ? pages[index + 1] : false;

          spreads.push([left_page, right_page]);
          index += 2;
        }
      }
      return spreads;
    },
  },
};
