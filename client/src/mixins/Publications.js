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
    async duplicateModuleWithSourceMedias({ og_module, addtl_meta_to_module }) {
      let new_meta = {};
      const new_source_medias = [];

      for (let {
        path,
        meta_filename_in_project,
        meta_filename,
        ...props
      } of og_module.source_medias) {
        let new_media_obj = Object.assign({}, props);

        if (path) {
          // old school path prop: could be either path to text in /publications
          // or path to media in parent project
          // now we only extract the meta_filename to make projects and publications portable, independent from the space
          if (path.includes("/publications/"))
            meta_filename = this.getFilename(path);
          else meta_filename_in_project = this.getFilename(path);
        }

        if (meta_filename) {
          const og_file_path = this.getSourceMedia({
            source_media: { meta_filename },
            folder_path: this.getParent(og_module.$path),
          }).$path;
          const copy_file_path = await this.$api.copyFile({
            path: og_file_path,
          });
          new_media_obj.meta_filename = copy_file_path;
        } else if (meta_filename_in_project) {
          // linked media in project
          new_media_obj.meta_filename_in_project = meta_filename_in_project;
        }
        new_source_medias.push(new_media_obj);
      }
      new_meta.source_medias = new_source_medias;

      Object.assign(new_meta, addtl_meta_to_module);

      const meta_filename = await this.$api
        .copyFile({
          path: og_module.$path,
          new_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
      return meta_filename;
    },
  },
};
