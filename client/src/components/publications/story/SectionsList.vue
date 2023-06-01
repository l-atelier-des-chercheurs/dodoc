<template>
  <div class="_sectionsList">
    <SectionsSummary
      :sections="sections"
      :opened_section="opened_section"
      :can_edit="can_edit"
      @createSection="createSection"
      @openSection="openSection"
      @updateOrder="updateOrder"
    />
    <transition name="pagechange" mode="out-in">
      <div v-if="opened_section" :key="opened_section.$path">
        <SingleSection
          ref="section"
          :publication="publication"
          :section="opened_section"
          :can_edit="can_edit"
          @remove="removeSection(opened_section.$path)"
          @close="closeSection"
        />
        <div class="_navBtns">
          <div class="_navBtns--content">
            <span v-if="prev_section" class="_navbtn" @click="prevSection">
              <sl-icon name="arrow-left-circle" />
              {{ prev_section.section_title }}
            </span>
            <span v-if="next_section" class="_navbtn" @click="nextSection">
              {{ next_section.section_title }}
              <sl-icon name="arrow-right-circle" />
            </span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import SectionsSummary from "@/components/publications/story/SectionsSummary.vue";
import SingleSection from "@/components/publications/story/SingleSection.vue";

export default {
  props: {
    publication: Object,
    section_opened_meta: String,
    can_edit: Boolean,
  },
  components: {
    SectionsSummary,
    SingleSection,
  },
  data() {
    return {};
  },
  provide() {
    return {
      $getMetaFilenamesAlreadyPresent: () =>
        this.meta_filenames_already_present,
    };
  },
  created() {},
  mounted() {
    if (this.publication.sections_list && !this.section_opened_meta) {
      this.$emit(
        "toggleSection",
        this.publication.sections_list[0].meta_filename
      );
    }
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    sections_list() {
      return this.publication.sections_list || [];
    },
    sections() {
      const all_sections = this.publication.$files
        ? this.publication.$files.filter((f) =>
            Object.prototype.hasOwnProperty.call(f, "section_type")
          )
        : [];

      if (all_sections.length === 0 || !this.publication.sections_list)
        return [];

      return this.publication.sections_list.map(({ meta_filename }) => {
        return all_sections.find((s) => s.$path.endsWith("/" + meta_filename));
      });
    },
    opened_section() {
      return this.publication.$files?.find((f) =>
        f.$path.endsWith("/" + this.section_opened_meta)
      );
    },
    opened_section_index() {
      return this.sections.findIndex(
        (s) => s.$path === this.opened_section.$path
      );
    },
    next_section() {
      if (this.opened_section_index < this.sections.length - 1)
        return this.sections[this.opened_section_index + 1];
      return false;
    },
    prev_section() {
      if (this.opened_section_index > 0)
        return this.sections[this.opened_section_index - 1];
      return false;
    },
    meta_filenames_already_present() {
      const current = [];
      const other = [];

      this.sections.map((s) => {
        const is_current_section = s.$path === this.opened_section?.$path;

        if (s.modules_list && Array.isArray(s.modules_list))
          s.modules_list.map((module_meta) => {
            const section_module = this.publication.$files.find((f) => {
              return this.getFilename(f.$path) === module_meta;
            });
            if (
              section_module.source_medias &&
              Array.isArray(section_module.source_medias)
            )
              section_module.source_medias.map((sm) => {
                if (is_current_section)
                  current.push(sm.meta_filename_in_project);
                else other.push(sm.meta_filename_in_project);
              });
          });
      });

      return { current, other };
      // return this.modules_list.reduce((acc, meta_filename) => {
      //   const module = this.findModuleFromMetaFilename(meta_filename);
      //   if (module.source_medias) {
      //     module.source_medias.map((sm) => {
      //       if (sm.meta_filename_in_project)
      //         acc.push(sm.meta_filename_in_project);
      //     });
      //   }
      //   return acc;
      // }, []);
    },
  },
  methods: {
    async createSection() {
      const section_meta_filename = await this.$api
        .uploadFile({
          path: this.publication.$path,
          additional_meta: {
            section_type: "-",
            requested_slug: "section",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });

      let sections_list = this.sections_list.slice();
      sections_list.push({
        meta_filename: section_meta_filename,
      });
      await this.updatePubliMeta({
        sections_list,
      });
      this.$emit("toggleSection", section_meta_filename);
    },
    async removeSection(path) {
      const section_meta_filename = this.getFilename(path);
      let sections_list = this.sections_list.slice();
      sections_list = sections_list.filter(
        (f) => f.meta_filename !== section_meta_filename
      );
      this.updatePubliMeta({
        sections_list,
      });
      await this.$api.deleteItem({
        path,
      });
    },
    async updatePubliMeta(new_meta) {
      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta,
      });
    },
    openSection(path) {
      const section_meta_filename = this.getFilename(path);
      this.$emit("toggleSection", section_meta_filename);
    },
    closeSection() {
      this.$eventHub.$emit(`sections.open_summary`);
      this.$emit("toggleSection", false);
    },
    updateOrder(items) {
      const sections_list = items.map((i) => {
        return {
          meta_filename: this.getFilename(i.$path),
        };
      });

      if (JSON.stringify(sections_list) === JSON.stringify(this.sections_list))
        return "no_update_necessary";

      this.updatePubliMeta({
        sections_list,
      });
    },
    nextSection() {
      this.openSection(this.next_section.$path);
      setTimeout(() => {
        this.scrollToTop();
      }, 150);
    },
    prevSection() {
      this.openSection(this.prev_section.$path);
      setTimeout(() => {
        this.scrollToTop();
      }, 150);
    },
    scrollToTop() {
      // if (this.$refs.section)
      //   this.$refs.section.scrollIntoView({
      //     behavior: "smooth",
      //     inline: "nearest",
      //   });
      this.$el.scrollIntoView({
        behavior: "smooth",
        inline: "nearest",
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsList {
  position: relative;
}

._sectionTitle {
}

._navBtns {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: underline;
  margin-bottom: calc(var(--spacing) * 4);
}
._navBtns--content {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._navbtn {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 4);

  background: white;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 6px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);

  &:hover,
  &:focus-visible {
    background: var(--c-gris);
  }
}
</style>
