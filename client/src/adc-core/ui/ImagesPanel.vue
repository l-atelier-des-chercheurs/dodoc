<template>
  <div>
    <section class="_section">
      <h3 class="_sectionTitle">{{ $t("imported_images") }}</h3>
      <p class="u-instructions">
        <small>{{ $t("imported_images_instr") }}</small>
      </p>

      <div class="u-spacingBottom">
        <input
          type="file"
          multiple="multiple"
          :id="id + '-add_file'"
          name="file"
          accept="image/*"
          class="inputfile-2"
          @change="updateInputFiles($event)"
        />
        <label :for="id + '-add_file'">
          <svg width="20" height="17" viewBox="0 0 20 17">
            <path
              d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
            />
          </svg>
          {{ $t("import") }}
        </label>
        <UploadFiles
          v-if="selected_files.length > 0"
          :files_to_import="selected_files"
          :path="settings.$path"
          :additional_meta="{ $origin: 'settings' }"
          @close="selected_files = []"
        />
      </div>

      <div v-if="has_images" class="_imagesList">
        <div
          class="_imagesList--image"
          v-for="image in settings_file"
          :key="image.$path"
        >
          <MediaContent :file="image" :context="'preview'" :resolution="640" />
          <div
            v-if="usagesOf(image.$path).length > 0"
            class="_usages"
            :title="usagesOf(image.$path).join(', ')"
          >
            <span v-for="usage in usagesOf(image.$path)" :key="usage">
              {{ usage }}
            </span>
          </div>
          <RemoveMenu
            class="_removeMedia"
            :show_button_text="false"
            :button_text="$t('remove_this_image')"
            @remove="removeMedia(image.$path)"
          >
            <template #trigger>
              <button type="button" class="u-button_icon u-button_red">
                <b-icon icon="trash" />
              </button>
            </template>
          </RemoveMenu>
        </div>
      </div>
      <p v-else class="u-instructions">
        <small>{{ $t("start_by_uploading_images") }}</small>
      </p>
    </section>

    <section
      v-for="group of image_groups"
      class="_section"
      :key="group.key"
    >
      <h3 class="_sectionTitle">{{ group.label }}</h3>

      <div
        v-for="ptype of group.types"
        class="u-spacingBottom"
        :key="ptype.key"
      >
        <DLabel :str="ptype.label" />
        <p class="u-instructions _instr">
          <small>{{ ptype.instructions }}</small>
        </p>
        <RadioCheckboxField
          v-if="has_images"
          :field_name="ptype.key"
          :input_type="'radio'"
          :content="settings[ptype.key]"
          :path="settings.$path"
          :can_edit="can_edit"
          :options="editing_options"
        >
          <template #preview="{ item }">
            <div v-if="item && item.thumb_src" class="_slotPreview">
              <img :src="item.thumb_src" role="presentation" />
              <small>{{ item.label }}</small>
            </div>
            <small v-else class="u-instructions">
              {{ $t(ptype.empty_label) }}
            </small>
          </template>
        </RadioCheckboxField>
      </div>

      <template v-if="group.key === 'home'">
        <ColorInput
          class="u-spacingBottom"
          :label="$t('hero_background_color')"
          :allow_transparent="true"
          :value="settings.hero_background_color"
          @save="saveNewHeroBgColor({ $event, field: 'hero_background_color' })"
        />

        <ColorInput
          class="u-spacingBottom"
          :label="$t('text_background_color')"
          :allow_transparent="true"
          :value="settings.text_background_color"
          @save="saveNewHeroBgColor({ $event, field: 'text_background_color' })"
        />

        <div class="u-spacingBottom">
          <DLabel :str="$t('text_image_layout')" />
          <RadioCheckboxField
            :field_name="'text_image_layout'"
            :input_type="'radio'"
            :content="settings['text_image_layout'] || 'image_text'"
            :path="settings.$path"
            :can_edit="can_edit"
            :options="layout_options"
          />
        </div>
      </template>
    </section>

    <div class="u-instructions">
      <button type="button" class="u-buttonLink" @click="$emit('reloadPage')">
        {{ $t("refresh_window_to_see_changes") }}
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    settings: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      selected_files: [],
      id: `admin_images_upload_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      image_groups: [
        {
          key: "navigation",
          label: this.$t("navigation_and_tab"),
          types: [
            {
              key: "topbar_image_name",
              label: this.$t("topbar_image"),
              short_label: this.$t("logo"),
              instructions: this.$t("topbar_image_instr"),
              empty_label: "default_dodoc_logo",
            },
            {
              key: "favicon_image_name",
              label: this.$t("favicon_image"),
              short_label: this.$t("favicon"),
              instructions: this.$t("favicon_image_instr"),
              empty_label: "default_dodoc_favicon",
            },
          ],
        },
        {
          key: "home",
          label: this.$t("home_page"),
          types: [
            {
              key: "hero_image_name",
              label: this.$t("hero_image"),
              short_label: this.$t("home_page"),
              instructions: this.$t("hero_image_instr"),
              empty_label: "no_image",
            },
          ],
        },
      ],

      layout_options: [
        {
          key: "image_text",
          label: this.$t("layout_image_text"),
        },
        {
          key: "text_image",
          label: this.$t("layout_text_image"),
        },
        {
          key: "text_image_overlay",
          label: this.$t("layout_text_image_overlay"),
        },
        {
          key: "image_text_overlay",
          label: this.$t("layout_image_text_overlay"),
        },
      ],
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    settings_file() {
      return this.settings?.$files;
    },
    has_images() {
      return this.settings_file?.length > 0;
    },
    image_types() {
      return this.image_groups.flatMap((g) => g.types);
    },
    editing_options() {
      if (!this.settings.$files || this.settings.$files.length === 0) return [];

      let _options = [];

      _options.push({
        key: "",
        label: this.$t("none"),
      });

      this.settings.$files.map((image) => {
        const thumb_src = this.makeRelativeURLFromThumbs({
          $thumbs: image.$thumbs,
          $type: image.$type,
          $path: "",
          resolution: 640,
        });

        _options.push({
          key: image.$path,
          label: image.$media_filename || image.$path,
          thumb_src,
        });
      });

      return _options;
    },
  },
  methods: {
    async saveNewHeroBgColor({ $event, field }) {
      await this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: {
          [field]: $event || "",
        },
      });
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
    async updateImageField(new_path, key) {
      await this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: {
          [key]: new_path,
        },
      });
    },
    usagesOf(path) {
      return this.image_types
        .filter((t) => this.settings[t.key] === path)
        .map((t) => t.short_label);
    },
    async removeMedia(path) {
      // don't leave the logo/favicon/home image pointing to a removed file
      const new_meta = {};
      for (const { key } of this.image_types)
        if (this.settings[key] === path) new_meta[key] = "";
      if (Object.keys(new_meta).length > 0)
        await this.$api.updateMeta({ path: this.settings.$path, new_meta });

      await this.$api.deleteItem({
        path,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._section {
  margin-bottom: calc(var(--spacing) * 2);
}
._sectionTitle {
  margin: 0 0 calc(var(--spacing) / 4);
}
._instr {
  margin: 0 0 calc(var(--spacing) / 4);
}

._slotPreview {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  img {
    width: 4rem;
    height: 4rem;
    object-fit: contain;
    background: var(--c-gris_clair);
    border-radius: 2px;
  }
}

._usages {
  position: absolute;
  bottom: 2px;
  left: 2px;
  right: 2px;
  z-index: 1;
  display: flex;
  flex-flow: row wrap;
  gap: 2px;
  pointer-events: none;

  span {
    background: var(--c-bleuvert);
    color: white;
    font-size: 0.6rem;
    line-height: 1.2;
    padding: 1px 3px;
    border-radius: 2px;
  }
}

._cover {
  position: relative;
  width: 100%;
  aspect-ratio: 2/1;
  border: 2px solid var(--c-gris);

  ::v-deep img {
    object-fit: scale-down;
  }
}

._imagesList {
  border: 2px solid var(--c-gris);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 2px;
  padding: calc(var(--spacing) / 4);
}
._imagesList--image {
  position: relative;
  width: 100%;
  aspect-ratio: 1;

  ::v-deep {
    ._mediaContent {
      width: 100%;
      height: 100%;
    }

    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-width: none;
    }
  }
}
._removeMedia {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
