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
    <!-- <div class="" v-for="(section, index) of sections" :key="section.$path">
        <button
          type="button"
          class="u-button"
          @click="openSection(section.$path)"
        >
          <span
            v-html="section.section_title || $t('section') + ' ' + (index + 1)"
          />
        </button>
        <button
          type="button"
          class="u-button"
          @click="removeSection(section.$path)"
        >
          remove
        </button>
      </div> -->

    <transition name="pagechange" mode="out-in">
      <div v-if="opened_section" :key="opened_section.$path">
        <SingleSection
          :publication="publication"
          :section="opened_section"
          :can_edit="can_edit"
          @remove="removeSection(opened_section.$path)"
          @close="closeSection"
        />
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
  },
};
</script>
<style lang="scss" scoped>
._sectionsList {
  position: relative;
}

._sectionTitle {
}
</style>
