<template>
  <div class="_cover">
    <div class="" v-if="!cover_media">
      <DLabel :str="$t('cover')" />
      <button
        type="button"
        class="u-button u-button_bleuvert u-button_small"
        @click="createCover"
      >
        {{ $t("create") }}
      </button>
    </div>
    <template v-if="cover_media">
      <div class="u-spacingBottom">
        <!-- <TitleField
          :field_name="'$content'"
          :label="$t('title')"
          :content="cover_media.$content"
          :path="cover_media.$path"
          :required="false"
          :input_type="'editor'"
          :tag="'h2'"
          :can_edit="can_edit"
        /> -->
        <CollaborativeEditor3
          :label="$t('title')"
          :content="cover_media.$content"
          :path="cover_media.$path"
          :custom_formats="[]"
          :save_format="'raw'"
          :can_edit="true"
        />
      </div>

      <div class="_cover--pickCover">
        <template v-if="cover_image_media">
          <div class="_cover--pickCover--img">
            <MediaContent :file="cover_image_media" :resolution="1600" />
            <div class="_cover--pickCover--img--buttons">
              <button
                type="button"
                class="u-button u-button_bleuvert u-button_small"
                @click="show_cover_picker = true"
              >
                {{ $t("change") }}
              </button>
              <button
                type="button"
                class="u-button u-button_red u-button_small"
                @click="removeImage"
              >
                {{ $t("remove") }}
              </button>
            </div>
          </div>
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
          @pickMedias="pickCover"
          @close="show_cover_picker = false"
        />
      </div>
      <div class="u-spacingBottom" />
      <DLabel :str="$t('text_image_layout')" />
      <SelectField2
        :field_name="'cover_layout_mode'"
        :value="cover_media.cover_layout_mode"
        :path="cover_media.$path"
        :hide_validation="true"
        :can_edit="true"
        :options="cover_layout_mode_options"
      />

      <RemoveMenu @remove="removeCover" />
    </template>
  </div>
</template>
<script>
import MediaPicker from "@/components/publications/MediaPicker.vue";
export default {
  props: {
    publication: {
      type: Object,
      required: true,
    },
  },
  components: { MediaPicker },
  data() {
    return {
      show_cover_picker: false,
      cover_layout_mode_options: [
        {
          key: "",
          text: this.$t("normal"),
        },
        {
          key: "full_page",
          text: this.$t("full_page"),
        },
        {
          key: "text_top_image_down",
          text: this.$t("text_top_image_down"),
        },
        {
          key: "image_top_text_down",
          text: this.$t("image_top_text_down"),
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    cover_media() {
      return this.publication.$files?.find((f) => f.cover_type === "front");
    },
    cover_image_media() {
      const source_media = this.cover_media?.source_medias?.[0];
      if (!source_media) return false;

      const cover_file = this.getSourceMedia({
        source_media,
        folder_path: this.publication.$path,
      });
      if (cover_file) return cover_file;
      return false;
    },
  },
  methods: {
    async createCover() {
      const filename = "frontcover.txt";
      const { meta_filename } = await this.$api.uploadText({
        path: this.publication.$path,
        filename,
        content: this.$t("title"),
        additional_meta: {
          cover_type: "front",
        },
      });
    },
    async removeCover() {
      this.$api.deleteItem({
        path: this.cover_media.$path,
      });
    },

    async pickCover(medias) {
      const media = medias[0];
      const import_mode = this.$root.publication_include_mode;
      const new_entry = await this.prepareMediaForPublication({
        path_to_source_media_meta: media.$path,
        publication_path: this.publication.$path,
        import_mode,
      });

      this.$api.updateMeta({
        path: this.cover_media.$path,
        new_meta: {
          source_medias: [new_entry],
        },
      });
    },
    async removeImage() {
      this.$api.updateMeta({
        path: this.cover_media.$path,
        new_meta: {
          source_medias: [],
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._cover {
  position: relative;
  background-color: rgba(255, 255, 255, 1);
  padding: calc(var(--spacing) / 1);
  border-radius: var(--border-radius);
}
._cover--pickCover {
  position: relative;
  width: 100%;
  margin-bottom: calc(var(--spacing) / 2);
}
._cover--pickCover--img {
  position: relative;
  overflow: hidden;
  margin-bottom: calc(var(--spacing) / 1);
  background-color: var(--c-gris_clair);

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

._cover--pickCover--img--buttons {
  position: absolute;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);
}
</style>
