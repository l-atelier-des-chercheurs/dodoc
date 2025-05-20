<template>
  <div class="_publicationPreview">
    <div class="_publicationPreview--cover">
      <template v-if="cover_thumb">
        <img :src="cover_thumb" />
        <span
          v-if="template_icon && false"
          class="_iconPreview"
          v-html="template_icon"
        />
      </template>
      <template v-else>
        <div class="_noPreview">
          <span v-if="template_icon" v-html="template_icon" />
        </div>
      </template>
      <transition name="toggleLock" mode="out-in">
        <StatusTag
          v-if="
            publication.$status === 'finished' ||
            publication.$status === 'private'
          "
          class="_icon"
          :key="publication.$status"
          :show_label="false"
          :status="publication.$status"
          :can_edit="false"
          :mode="'inactive'"
        />
      </transition>

      <transition name="fade_fast">
        <div class="_previewProgress" v-if="is_making_preview">
          <AnimatedCounter :value="preview_progress" />
        </div>
      </transition>

      <!-- <button
        type="button"
        class="u-button u-button_small u-button_icon u-button_black _generatePreviewBtn"
        @click.stop="generatePreview"
      >
        <b-icon icon="arrow-clockwise" />
      </button> -->
      <div class="_generatePreviewBtn">
        <EditBtn
          v-if="can_edit && !is_making_preview"
          :btn_type="'regenerate_thumbs'"
          :style_type="'black'"
          :label_position="'left'"
          @click="generatePreview"
        />
      </div>
    </div>

    <header class="_header" @click="$emit('open')">
      <small v-if="publication.template" v-html="$t(publication.template)" />
      <h3>
        {{ publication.title }}
      </h3>
    </header>

    <button
      type="button"
      class="js--showCursor _openPublication"
      :title="$t('open') + ' ' + publication.title"
      @click="$emit('open')"
    />
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    template_options: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      is_making_preview: false,
      preview_progress: 0,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    cover_thumb() {
      return this.makeRelativeURLFromThumbs({
        $thumbs: this.publication.$cover,
        $type: "image",
        $path: this.publication.$path,
        resolution: 640,
      });
    },
    template_icon() {
      const t = this.template_options.find(
        (t) => t.key === this.publication.template
      );
      if (t) return t.icon;
      return false;
    },
  },
  methods: {
    async removePublication() {
      await this.$api.deleteItem({ path: this.publication.$path });
    },
    async generatePreview() {
      this.is_making_preview = true;

      const instructions = {
        recipe: "png",
        page: 1,
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
        make_preview: true,
      };

      const current_task_id = await this.$api.generatePreviewForPublication({
        path: this.publication.$path,
        instructions,
      });
      this.$api.join({ room: "task_" + current_task_id });

      const updateProgressPercent = ({ task_id, progress }) => {
        if (task_id === current_task_id) this.preview_progress = +progress;
      };
      this.$eventHub.$on("task.status", updateProgressPercent);

      const checkIfEnded = ({ task_id }) => {
        if (task_id !== current_task_id) return;
        this.preview_progress = 100;
        setTimeout(() => {
          this.is_making_preview = false;
          this.preview_progress = 0;
        }, 2000);
        this.$eventHub.$off("task.ended", checkIfEnded);
        this.$eventHub.$off("task.status", updateProgressPercent);
        this.$api.leave({ room: "task_" + current_task_id });
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationPreview {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  box-shadow: none;
  // padding: calc(var(--spacing) / 2);
}
._publicationPreview--cover {
  position: relative;
  // overflow: hidden;
  background: white;
  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

._header {
  cursor: pointer;
  overflow: hidden;
}
._generatePreviewBtn {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 1;
  margin: calc(var(--spacing) / 2);
}

._previewProgress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);
  pointer-events: none;

  padding: calc(var(--spacing) * 1);
  font-family: "Fira Code";
}

._iconPreview {
  width: 30px;
  height: 30px;
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 1;
  background: var(--c-bleuvert);
  margin: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4);
  border-radius: 4px;
}

._noPreview {
  display: flex;
  justify-content: center;
  align-content: center;
  align-items: center;
  // border: 2px solid white;
  padding: calc(var(--spacing) / 1);
  width: 100%;
  aspect-ratio: 1;
  min-height: 50px;
}

._icon {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 1);
  font-size: 125%;
}
._check {
  color: var(--c-bleuvert);
}
._private {
}

._openPublication {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 0;
  background: transparent;

  &:focus-visible {
    outline: 2px solid var(--active-color);
  }
}
</style>
