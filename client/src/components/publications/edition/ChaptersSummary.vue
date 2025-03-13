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
        <SetCover
          :key="'cover'"
          :publication="publication"
          :can_edit="can_edit"
        />
        <ChapterPreview
          v-for="(section, index) in sections"
          :key="section.$path"
          :section="section"
          :index="index"
          :number_of_sections="sections.length"
          :can_edit="can_edit"
          @open="openSection(section.$path)"
          @moveSection="moveSection"
        />

        <div key="'add'" class="_addSection">
          <EditBtn
            v-if="can_edit"
            :btn_type="'create_chapter'"
            :is_unfolded="true"
            @click="createSection"
          />
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
    can_edit: Boolean,
  },
  components: { ChapterPreview, SetCover },
  data() {
    return {};
  },
  created() {},
  mounted() {
    if (this.can_edit && this.sections.length === 0) this.createSection();
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
    new_section_title() {
      let idx = this.sections.length + 1;
      const makeTitle = (i) => this.$t("section") + " " + i;

      let new_section_title = makeTitle(idx);
      while (this.sections.some((s) => s.section_title === new_section_title)) {
        idx++;
        new_section_title = makeTitle(idx);
      }
      return new_section_title;
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
    async createSection() {
      const filename = this.new_section_title + " text.txt";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: "",
        additional_meta: {
          content_type: "markdown",
        },
      });

      const new_section_meta = await this.createSection2({
        publication: this.publication,
        additional_meta: {
          section_title: this.new_section_title,
          main_text_meta: meta_filename,
          section_starts_on_page: "right",
        },
      });
      // this.$emit("toggleSection", new_section_meta);
    },
    async moveSection({ old_position, new_position }) {
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

      return await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          sections_list: sections_meta,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._chaptersSummary {
  position: relative;
}

._content {
  margin-bottom: calc(var(--spacing) * 2);
}

._createSection {
  padding: calc(var(--spacing) / 4);
}

._allChapters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  // grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 1);
}

._addSection {
  display: flex;
  // justify-content: center;
  align-items: center;
  // background-color: white;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
  padding: 0;
}
</style>
