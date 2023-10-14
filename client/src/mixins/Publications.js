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
    findModuleFromMetaFilename({ files, meta_filename }) {
      if (!files) return [];
      return files.find((f) => {
        const _meta_name = this.getFilename(f.$path);
        return _meta_name === meta_filename;
      });
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
    getModulesForSection({ publication, section }) {
      if (Array.isArray(section?.modules_list)) {
        const modules_list = section.modules_list.reduce(
          (acc, meta_filename) => {
            const _module = this.findModuleFromMetaFilename({
              files: publication.$files,
              meta_filename,
            });
            if (_module) acc.push({ meta_filename, _module });
            return acc;
          },
          []
        );
        return modules_list;
      }
      return [];
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
    firstMedia(page_module) {
      if (!page_module) return false;
      try {
        const source_media = page_module.source_medias[0];
        const publication_path = this.getParent(page_module.$path);

        return this.getSourceMedia({
          source_media,
          folder_path: publication_path,
        });
      } catch (err) {
        return false;
      }
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

    /////////////////////////////////////////////////////

    getSectionsList({ publication, group }) {
      return Array.isArray(publication[group]) ? this.publication[group] : [];
    },
    getSectionsWithProps({ publication, group }) {
      return this.getSectionsList({
        publication: publication,
        group,
      }).reduce((acc, l) => {
        const section_module = this.findModuleFromMetaFilename({
          files: publication.$files,
          meta_filename: l.meta_filename,
        });
        if (section_module) acc.push(section_module);
        return acc;
      }, []);
    },
    async createSection2({ publication, type, group, title }) {
      let additional_meta = {
        section_type: "-",
        section_title: title,
        requested_slug: type,
      };

      const section_meta_filename = await this.$api
        .uploadFile({
          path: publication.$path,
          additional_meta,
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let sections_list = this.getSectionsList({ publication, group }).slice();
      sections_list.push({
        meta_filename: section_meta_filename,
      });

      await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          [group]: sections_list,
        },
      });

      return section_meta_filename;
    },
    async removeSection2({ publication, group, path }) {
      const section_meta_filename = this.getFilename(path);
      let sections_list = this.getSectionsList({ publication, group }).slice();
      sections_list = sections_list.filter(
        (f) => f.meta_filename !== section_meta_filename
      );

      await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          [group]: sections_list,
        },
      });

      await this.$api.deleteItem({
        path,
      });
    },
    async insertModuleMetaFilenamesToList2({
      publication,
      section,
      index,
      meta_filenames,
    }) {
      const section_modules_list = this.getModulesForSection({
        publication,
        section,
      });
      let modules_list = section_modules_list.map((m) => m.meta_filename);

      if (typeof index !== "number")
        modules_list = modules_list.concat(meta_filenames);
      else modules_list.splice(index, 0, ...meta_filenames);

      await this.$api.updateMeta({
        path: section.$path,
        new_meta: {
          modules_list,
        },
      });
    },

    async moveModuleTo2({ publication, section, meta_filename, new_position }) {
      let modules_list = this.getModulesForSection({
        publication,
        section,
      }).map((m) => m.meta_filename);

      const target_meta_index = modules_list.findIndex(
        (m) => m === meta_filename
      );
      modules_list.move(target_meta_index, new_position);

      await this.$api.updateMeta({
        path: section.$path,
        new_meta: {
          modules_list,
        },
      });
    },

    async duplicatePublicationMedia2({
      publication,
      section,
      source_meta_filename,
      copy_meta_filename,
    }) {
      let modules_list = this.getModulesForSection({
        publication,
        section,
      }).map((m) => m.meta_filename);

      const position_of_original_media = modules_list.findIndex(
        (_mf) => _mf === source_meta_filename
      );

      debugger;

      modules_list.splice(
        position_of_original_media + 1,
        0,
        copy_meta_filename
      );

      await this.$api.updateMeta({
        path: section.$path,
        new_meta: {
          modules_list,
        },
      });
    },

    async removeModule2({ publication, section, path }) {
      let modules_list = this.getModulesForSection({
        publication,
        section,
      })
        .map((m) => m.meta_filename)
        .slice();
      const meta_filename = this.getFilename(path);
      modules_list = modules_list.filter((_mf) => _mf !== meta_filename);

      await this.$api.updateMeta({
        path: section.$path,
        new_meta: {
          modules_list,
        },
      });
      await this.$api.deleteItem({
        path,
      });
    },
  },
};
