<template>
  <div class="_chaptersSummary">
    <div class="_content">
      <!-- <DLabel :str="$t('content')" /> -->
      <transition-group
        tag="div"
        name="listComplete"
        class="_allChapters"
        appear
        key="allpages"
      >
        <SetCover :key="'cover'" :publication="publication" />
        <ChapterPreview
          v-for="(section, index) in sections"
          :key="section.$path"
          :section="section"
          :index="index"
          :number_of_sections="sections.length"
          :view_mode="view_mode"
          :pages_positions="getPagesPositions(section.$path)"
          @open="openSection(section.$path)"
          @moveSection="moveSection"
          @remove="$emit('removeChapter', section)"
        />

        <div key="'add'" class="_addSection">
          <button
            type="button"
            class="u-button u-button_bleuvert u-button_small"
            @click="createSection({ type: 'text' })"
          >
            <b-icon icon="plus-lg" />
            {{ $t("text") }}
          </button>
          <button
            type="button"
            class="u-button u-button_bleuvert u-button_small"
            @click="createSection({ type: 'gallery' })"
          >
            <b-icon icon="plus-lg" />
            {{ $t("gallery") }}
          </button>
          <button
            type="button"
            class="u-button u-button_bleuvert u-button_small"
            @click="createSection({ type: 'story' })"
          >
            <b-icon icon="plus-lg" />
            {{ $t("story") }}
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>
<script>
import SetCover from "@/components/publications/edition/SetCover.vue";
import ChapterPreview from "@/components/publications/edition/ChapterPreview.vue";

export default {
  props: {
    publication: Object,
    sections: Array,
    opened_section_meta_filename: String,
    view_mode: String,
    chapters_positions: Object,
  },
  components: { ChapterPreview, SetCover },
  data() {
    return {};
  },
  created() {},
  mounted() {
    // if (this.sections.length === 0) this.createSection({ type: "text" });
  },
  beforeDestroy() {},
  watch: {
    opened_section_meta_filename() {
      // this.openFirstSectionIfNoneOpened();
    },
  },
  computed: {
    is_associated_to_map() {
      return this.$getMapOptions;
    },
    new_section_index() {
      let idx = this.sections.length + 1;
      const makeTitle = (i) => " " + i;

      let new_section_index = makeTitle(idx);
      while (
        this.sections.some((s) => s.section_title.endsWith(new_section_index))
      ) {
        idx++;
        new_section_index = makeTitle(idx);
      }
      return new_section_index;
    },
    opened_section() {
      return this.sections.find(
        (s) => this.getFilename(s.$path) === this.opened_section_meta_filename
      );
    },
  },
  methods: {
    openSection(path) {
      this.$emit("toggleSection", this.getFilename(path));
    },
    // openFirstSectionIfNoneOpened() {
    //   if (this.sections.length > 0 && !this.opened_section_meta_filename) {
    //     this.$emit("openFirstSection");
    //   }
    // },
    async createSection({ type = "text" } = {}) {
      let additional_meta = {
        section_starts_on_page: "right",
      };

      if (type === "text") {
        const filename = this.new_section_title + " text.txt";
        const { meta_filename } = await this.$api.uploadText({
          path: this.publication.$path,
          filename,
          content: "",
          additional_meta: {
            content_type: "markdown",
          },
        });
        additional_meta.section_title =
          this.$t("section") + " " + this.new_section_index;
        additional_meta.section_type = "text";
        additional_meta.main_text_meta = meta_filename;
      } else if (type === "gallery") {
        additional_meta.section_title =
          this.$t("gallery") + " " + this.new_section_index;
        additional_meta.section_type = "gallery";
      } else if (type === "story") {
        additional_meta.section_title =
          this.$t("story") + " " + this.new_section_index;
        additional_meta.section_type = "story";
      }

      const new_section_meta = await this.createSection2({
        publication: this.publication,
        additional_meta,
      });
      setTimeout(() => {
        this.$emit("toggleSection", new_section_meta);
      }, 100);

      // this.openSection(new_section_meta);
    },
    async moveSection({ old_position, new_position }) {
      const section_meta_filename = this.getFilename(
        this.sections[old_position].$path
      );
      let sections_meta = this.sections.map((s) => ({
        meta_filename: this.getFilename(s.$path),
      }));

      function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
            arr.push(undefined);
          }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
      }

      array_move(sections_meta, old_position, new_position);

      await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          sections_list: sections_meta,
        },
      });

      setTimeout(() => {
        this.$eventHub.$emit("edition.zoomToSection", section_meta_filename);
      }, 500);
    },
    getPagesPositions(path) {
      const section_meta_filename = this.getFilename(path);
      return this.chapters_positions[section_meta_filename];
    },
  },
};
</script>
<style lang="scss" scoped>
._chaptersSummary {
  position: relative;
}

._content {
  margin-bottom: calc(var(--spacing) * 4);
}

._createSection {
  padding: calc(var(--spacing) / 4);
}

._allChapters {
  display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  // grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
  gap: calc(var(--spacing) * 1) calc(var(--spacing) * 1);
}

._addSection {
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  background-color: white;
  gap: calc(var(--spacing) / 2);
  // justify-content: center;
  // align-items: center;
  // background-color: white;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
  // padding: 0;

  // box-shadow: 0 0 0 1px hsla(230, 13%, 9%, 0.05),
  //   0 0.3px 0.4px hsla(230, 13%, 9%, 0.02),
  //   0 0.9px 1.5px hsla(230, 13%, 9%, 0.025),
  //   0 3.5px 6px hsla(230, 13%, 9%, 0.09);
  border-radius: var(--border-radius);
}
</style>
