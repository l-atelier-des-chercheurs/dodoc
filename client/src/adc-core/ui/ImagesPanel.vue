<template>
  <div>
    <!-- <div class="_cover">
      <CoverField
        :context="'full'"
        :cover="settings.$cover"
        :path="settings.$path"
        :can_edit="can_edit"
      />
    </div>
    <div class="u-instructions">
      {{ $t("logo_instr") }}
    </div> -->

    <DLabel :str="$t('images')" />
    <div class="">
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
        :selected_files="selected_files"
        :path="settings.$path"
        @close="selected_files = []"
      />

      <div
        class="_imagesList"
        v-if="settings.$files && settings.$files.length > 0"
      >
        <div
          class="_imagesList--image"
          v-for="image in settings.$files"
          :key="image.$path"
        >
          <MediaContent :file="image" :context="'preview'" :resolution="640" />
        </div>
      </div>
    </div>

    <br />

    <div class="" v-if="settings.$files">
      <div v-for="ptype of possible_types" :key="ptype.key">
        <DLabel :str="ptype.label" />

        <RadioCheckboxField
          :field_name="ptype.key"
          :input_type="'radio'"
          :content="settings[ptype.key]"
          :path="settings.$path"
          :can_edit="can_edit"
          :options="editing_options"
        />

        <div class="u-instructions" v-if="ptype.instructions">
          <small>
            {{ ptype.instructions }}
          </small>
        </div>
        <br />
      </div>
    </div>

    <br />

    <ColorInput
      class="u-spacingBottom"
      :label="$t('hero_background_color')"
      :value="settings.hero_background_color"
      @save="saveNewHeroBgColor({ $event, field: 'hero_background_color' })"
    />

    <br />

    <ColorInput
      class="u-spacingBottom"
      :label="$t('text_background_color')"
      :value="settings.text_background_color"
      @save="saveNewHeroBgColor({ $event, field: 'text_background_color' })"
    />

    <div class="u-instructions">
      <button type="button" class="u-buttonLink" @click="$emit('reloadPage')">
        {{ $t("refresh_window_to_apply") }}
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

      possible_types: [
        {
          key: "favicon_image_name",
          label: this.$t("favicon_image"),
          instructions: this.$t("favicon_image_instr"),
        },
        {
          key: "topbar_image_name",
          label: this.$t("topbar_image"),
          instructions: this.$t("topbar_image_instr"),
        },
        {
          key: "hero_image_name",
          label: this.$t("hero_image"),
          instructions: this.$t("hero_image_instr"),
        },
      ],
    };
  },
  created() {},
  async mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
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
          label: image.$path,
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
    imageSelected(key) {
      return this.settings[key];
      // return path of select image
    },
    async updateImageField(new_path, key) {
      await this.$api.updateMeta({
        path: this.settings.$path,
        new_meta: {
          [key]: new_path,
        },
      });
    },
  },
};
</script>
<style lang="scss" scoped>
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
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 2px;
  padding: calc(var(--spacing) / 4);
}
._imagesList--image {
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
</style>
