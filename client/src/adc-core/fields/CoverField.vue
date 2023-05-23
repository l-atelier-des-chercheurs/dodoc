<template>
  <div
    class="_coverField"
    :class="{
      'is--empty': !cover_thumb,
    }"
  >
    <div class="_hasImage" v-if="cover_thumb">
      <img :src="cover_thumb" />

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
          <img :src="cover_thumb" />
        </FullscreenView>
      </template>
    </div>
    <div v-else class="_noImage" />

    <div class="_editingPane" v-if="context === 'full' && can_edit">
      <EditBtn v-if="!edit_mode" @click="enableEditMode" />
      <BaseModal2
        v-if="edit_mode"
        :title="$t('pick_cover')"
        @close="edit_mode = false"
      >
        <div class="_picker">
          <ImageSelect
            v-if="edit_mode"
            :path="path"
            :existing_preview="existing_preview"
            @newPreview="
              (value) => {
                new_cover = value;
              }
            "
          />

          <div class="_footer">
            <SaveCancelButtons
              class="_scb"
              :is_saving="is_saving"
              :allow_save="allow_save"
              @save="updateCover"
              @cancel="cancel"
            />
          </div>
        </div>
      </BaseModal2>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    cover: [Boolean, Object],
    path: String,
    context: String,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      selected_file: [],
      new_cover: "",
      allow_save: true,

      edit_mode: false,
      is_saving: false,
      show_cover_fullscreen: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.cover,
        $type: "image",
        $path: this.path,
        resolution: this.context === "full" ? 2000 : 640,
      });
    },

    existing_preview() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.cover,
        $type: "image",
        $path: this.path,
        resolution: 320,
      });
    },
  },
  methods: {
    enableEditMode() {
      this.edit_mode = true;
    },
    cancel() {
      this.edit_mode = false;
      this.is_saving = false;
    },
    async updateCover() {
      this.is_saving = true;

      try {
        await this.$api.updateCover({
          path: this.path,
          new_cover_data: this.new_cover,
          // onProgress,
        });

        this.edit_mode = false;
        this.is_saving = false;
      } catch (e) {
        this.is_saving = false;
        this.edit_mode = false;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.couldntbesaved"));

        this.$alertify.closeLogOnClick(true).error(e.response);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._coverField {
  position: absolute;
  inset: 0;
  overflow: visible;

  --color1: var(--c-gris);
  --color2: var(--c-gris_clair);
  --color2: white;

  &.is--empty {
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
}

._picker {
  position: relative;
  // background: var(--c-noir);
  // color: white;
  // padding: calc(var(--spacing) / 4);
  // max-width: 320px;
  margin: calc(var(--spacing) / 4) auto;
  // border-radius: 4px;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  place-items: center;

  gap: calc(var(--spacing) / 2);
}

._editingPane {
  position: absolute;
  right: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
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
  z-index: -1;
  width: 100%;
  height: 100%;
  background-color: var(--c-gris_fonce);
}

._fsButton {
  position: absolute;
  left: 0;
  bottom: 0;
  margin: calc(var(--spacing) / 1);
}
</style>
