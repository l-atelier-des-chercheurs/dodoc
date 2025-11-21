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

    <template v-if="context === 'full' && can_edit">
      <button
        type="button"
        v-if="!cover_thumb"
        class="_addCoverBtn"
        @click="edit_mode = true"
        :title="$t('add_cover')"
      >
        <b-icon icon="plus-circle-fill" :scale="2" />
      </button>
      <div class="_editCoverBtn" v-else>
        <EditBtn
          :label_position="'left'"
          :is_unfolded="false"
          @click="edit_mode = true"
        />
      </div>
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
    </template>
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
  components: {
    ImageSelect: () => import("@/adc-core/fields/ImageSelect.vue"),
  },
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
  z-index: 1;
  overflow: hidden;

  --color1: var(--c-gris_clair);
  --color2: white;
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
    object-fit: scale-down;
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
    font-weight: 300;
    font-size: 1.5em;
    color: var(--c-bleumarine);
    user-select: none;

    font-size: 55cqw;
  }
}

._editCoverBtn {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
  transition: opacity 0.2s ease;

  @media (hover: hover) {
    ._coverField:not(:hover) & {
      opacity: 0;
    }
  }
}

._fsButton {
  position: absolute;
  left: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
}

._addCoverBtn {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 200%;
  color: var(--active-color);
  background: rgba(255, 255, 255, 0.5);
  transition: opacity 0.2s ease;

  .u-button_icon {
    font-size: 2rem;
  }

  @media (hover: hover) {
    &:not(:hover) {
      opacity: 0;
    }
  }
}
</style>
