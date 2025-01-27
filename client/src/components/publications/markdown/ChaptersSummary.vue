<template>
  <div class="_sectionsSummary">
    <transition-group
      tag="div"
      name="listComplete"
      class="_allChapters"
      key="allpages"
    >
      <div class="_cover" :key="'cover'">
        <div class="u-spacingBottom">
          <ToggleField
            :field_name="'cover_enabled'"
            :label="$t('use_cover')"
            :content="publication.cover_enabled"
            :path="publication.$path"
            :submit_on_change="true"
            :can_edit="can_edit"
          />
        </div>
        <template v-if="publication.cover_enabled">
          <div class="u-spacingBottom">
            <TitleField
              :field_name="'cover_title'"
              :label="$t('title')"
              :content="publication.cover_title"
              :path="publication.$path"
              :required="false"
              :input_type="'text'"
              :tag="'h2'"
              :can_edit="can_edit"
            />
          </div>

          <div class="_cover--pickCover">
            <template v-if="cover_image">
              <div class="_cover--pickCover--img">
                <MediaContent :file="cover_image" :resolution="1600" />
                <button
                  type="button"
                  class="u-button u-button_bleuvert u-button_small _changeCoverBtn"
                  @click="show_cover_picker = true"
                >
                  {{ $t("change") }}
                </button>
              </div>

              <div class="u-spacingBottom" />

              <SelectField2
                :field_name="'cover_image_layout'"
                :value="publication.cover_image_layout"
                :path="publication.$path"
                size="small"
                :hide_validation="true"
                :can_edit="can_edit"
                :options="[
                  {
                    key: '',
                    text: $t('normal'),
                  },
                  {
                    key: 'full_page',
                    text: $t('full_page'),
                  },
                  {
                    key: 'half_top',
                    text: $t('half_page_top'),
                  },
                  {
                    key: 'half_bottom',
                    text: $t('half_page_bottom'),
                  },
                ]"
              />
            </template>

            <template v-else>
              <button
                type="button"
                class="u-button u-button_bleuvert u-button_small"
                @click="show_cover_picker = true"
              >
                {{ $t("pick_cover") }}
              </button>
            </template>
            <MediaPicker
              v-if="show_cover_picker"
              :publication_path="publication.$path"
              :select_mode="'single'"
              :pick_from_types="['image']"
              @addMedias="pickCover"
              @close="show_cover_picker = false"
            />
          </div>
        </template>
      </div>

      <div v-for="(section, index) in sections" :key="section.$path">
        <ChapterPreview
          :section="section"
          :index="index"
          :number_of_sections="sections.length"
          :can_edit="can_edit"
          @open="openSection(section.$path)"
          @moveSection="moveSection"
        />
      </div>
      <div key="'add'" class="_addSection">
        <EditBtn
          v-if="can_edit"
          :btn_type="'add'"
          :is_unfolded="true"
          @click="createSection"
        />
      </div>
    </transition-group>
  </div>
</template>
<script>
import ChapterPreview from "@/components/publications/markdown/ChapterPreview.vue";
import MediaPicker from "@/components/publications/MediaPicker.vue";

export default {
  props: {
    publication: Object,
    cover_image: [Boolean, Object],
    sections: Array,
    opened_section_meta_filename: String,
    can_edit: Boolean,
  },
  components: { ChapterPreview, MediaPicker },
  data() {
    return {
      show_cover_picker: false,
    };
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
        content: "Contenu du " + this.new_section_title,
        additional_meta: {
          content_type: "markdown",
        },
      });

      const new_section_meta = await this.createSection2({
        publication: this.publication,
        additional_meta: {
          section_title: this.new_section_title,
          main_text_meta: meta_filename,
        },
      });
      this.$emit("toggleSection", new_section_meta);
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
    pickCover({ path_to_source_media_metas }) {
      const cover_meta_filename = this.getFilename(
        path_to_source_media_metas[0]
      );

      this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          cover_meta_filename,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._sectionsSummary {
  position: relative;
  height: 100%;
  overflow: auto;
  background-color: var(--c-gris_clair);

  padding: calc(var(--spacing) / 1);
}

._createSection {
  padding: calc(var(--spacing) / 4);
}

._allChapters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  // grid-template-rows: repeat(auto-fill, minmax(50px, 1fr));
  gap: calc(var(--spacing) / 2);

  > * {
    background-color: white;
    padding: calc(var(--spacing) / 2);
  }
}

._addSection {
  padding: calc(var(--spacing) / 1) calc(var(--spacing) * 2);
}

._cover {
  position: relative;
}
._cover--pickCover {
  position: relative;
  width: 100%;
  min-height: 100px;
  margin-bottom: calc(var(--spacing) / 2);
}
._cover--pickCover--img {
  position: relative;
  overflow: hidden;
  margin-bottom: calc(var(--spacing) / 1);
  background-color: var(--c-bodybg);

  ::v-deep {
    ._mediaContent,
    img {
      width: 100%;
      height: auto;
      max-height: 70px;
      object-fit: scale-down;
    }
  }
}

._changeCoverBtn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);
}
</style>
