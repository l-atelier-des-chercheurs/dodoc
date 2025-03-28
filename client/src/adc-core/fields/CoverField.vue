<template>
  <div class="_coverField">
    <div class="_hasImage" v-if="cover_thumb">
      <img
        :src="cover_thumb"
        :data-isround="preview_format === 'circle'"
        role="presentation"
      />
      <!-- // not actually useful since we dont know the size it will be shown at -->
      <!-- :srcset="cover_thumb_srcset" -->

      <template v-if="context === 'full'">
        <div class="_fsButton">
          <EditBtn
            :btn_type="'fullscreen'"
            @click="show_cover_fullscreen = true"
          />
        </div>
        <FullscreenView
          v-if="show_cover_fullscreen"
          @close="show_cover_fullscreen = false"
        >
          <img :src="cover_full" role="presentation" />
        </FullscreenView>
      </template>
    </div>
    <div
      v-else
      class="_noImage"
      :data-isround="preview_format === 'circle'"
      :data-placeholder="placeholder"
    >
      <span v-if="placeholder !== 'pattern'" class="_noImage--letter">
        {{ placeholder }}
      </span>
    </div>

    <div class="_editingPane" v-if="context === 'full' && can_edit">
      <EditBtn
        v-if="!edit_mode"
        :label_position="'left'"
        :is_unfolded="!cover_thumb"
        :label="!cover_thumb ? $t('add') : undefined"
        @click="enableEditMode"
      />
      <ImageSelect
        v-if="edit_mode"
        :path="path"
        :label="label_title"
        :ratio="ratio"
        :preview_format="preview_format"
        :existing_preview="existing_preview"
        :available_options="available_options"
        @close="edit_mode = false"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    cover: [Boolean, Object],
    title: String,
    path: String,
    context: String,
    ratio: {
      type: String,
      default: "3 / 2",
    },
    preview_format: String,
    placeholder: {
      type: String,
      default: "pattern",
    },
    available_options: {
      type: Array,
      default: () => ["import", "project", "capture"],
    },
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      selected_file: [],
      allow_save: true,

      edit_mode: false,

      show_cover_fullscreen: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    label_title() {
      if (this.title) return this.title;
      return this.$t("pick_cover");
    },
    cover_thumb() {
      return this.coverMakeRelativeURLFromThumbs(
        this.context === "full" ? 2000 : 640
      );
    },
    cover_thumb_srcset() {
      return `
        ${this.coverMakeRelativeURLFromThumbs(320)} 320w, 
        ${this.coverMakeRelativeURLFromThumbs(640)} 640w
      `;
    },
    cover_full() {
      return this.coverMakeRelativeURLFromThumbs(2000);
    },
    existing_preview() {
      return this.coverMakeRelativeURLFromThumbs(640);
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    coverMakeRelativeURLFromThumbs(res = 640) {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.cover,
        $type: "image",
        $path: this.path,
        resolution: res,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
._coverField {
  position: absolute;
  inset: 0;
  overflow: visible;

  --color1: white;
  --color2: var(--c-gris);
  // --color2: var(--c-gris_fonce);
}

._editingPane {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
}

[data-isround] {
  border-radius: 50%;
  overflow: hidden;
}

._hasImage {
  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

._noImage {
  position: absolute;
  z-index: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color1);

  &[data-placeholder="pattern"] {
    background: radial-gradient(
        circle,
        transparent 20%,
        var(--color1) 20%,
        var(--color1) 80%,
        transparent 80%,
        transparent
      ),
      radial-gradient(
          circle,
          transparent 20%,
          var(--color1) 20%,
          var(--color1) 80%,
          transparent 80%,
          transparent
        )
        15px 15px,
      linear-gradient(
          var(--color2) 1.2000000000000002px,
          transparent 1.2000000000000002px
        )
        0 -0.6000000000000001px,
      linear-gradient(
          90deg,
          var(--color2) 1.2000000000000002px,
          var(--color1) 1.2000000000000002px
        ) -0.6000000000000001px 0;
    background-size: 30px 30px, 30px 30px, 15px 15px, 15px 15px;
  }

  container-type: inline-size;
  ._noImage--letter {
    font-weight: 200;
    font-size: 1.5em;
    color: var(--c-bleumarine);
    user-select: none;

    font-size: 55cqw;
  }
}

._fsButton {
  position: absolute;
  left: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
