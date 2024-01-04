<template>
  <div class="_publicationPreview">
    <div class="_publicationPreview--cover" @click="$emit('open')">
      <div v-if="cover_thumb">
        <img :src="cover_thumb" />
        <span
          v-if="template_icon"
          class="_iconPreview"
          v-html="template_icon"
        />
      </div>
      <div v-else class="_noPreview">
        <span v-if="template_icon" v-html="template_icon" />
      </div>
      <transition name="toggleLock" mode="out-in">
        <sl-icon
          v-if="publication.$status === 'finished'"
          :key="publication.$status"
          name="check-circle-fill"
          class="_icon _check"
        />
        <sl-icon
          v-else-if="publication.$status === 'private'"
          :key="publication.$status"
          name="file-lock2-fill"
          class="_icon _private"
        />
      </transition>

      <transition name="fade_fast">
        <div class="_previewProgress" v-if="is_making_preview">
          <AnimatedCounter :value="preview_progress" />
        </div>
      </transition>
      <button
        type="button"
        class="u-button u-button_small u-button_white _generatePreviewBtn"
        v-if="can_edit && !is_making_preview"
        @click.stop="generatePreview"
      >
        <!-- <sl-icon name="card-image" /> -->
        <b-icon icon="arrow-clockwise" />
        <!-- {{ $t("generate_preview") }} -->
      </button>
    </div>

    <header class="_header" @click="$emit('open')">
      <small v-if="publication.template" v-html="$t(publication.template)" />
      <h2>
        {{ publication.title }}
      </h2>
    </header>
    <div class="">
      <!-- <button
        type="button"
        class="u-button u-button_red"
        @click="$emit('open')"
      >
        ouvrir&nbsp;
        <sl-icon name="arrow-up-right" />
      </button> -->
    </div>
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
      const instructions = {
        recipe: "png",
        page: 1,
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
      };

      this.is_making_preview = true;
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
  // width: 100%;
  // padding: var(--spacing);
}
._publicationPreview header {
  min-height: 7rem;
  cursor: pointer;
}
._publicationPreview--cover {
  position: relative;
  // border-radius: 2px;
  overflow: hidden;
  background: white;
  // border-bottom: 2px solid var(--c-gris);
  box-shadow: 0 1px 4px rgb(0 0 0 / 20%);

  cursor: pointer;
}

// ._projectInfos--cover {
//   position: relative;
//   aspect-ratio: 1/1;
//   background: var(--c-gris);
//   border: 2px solid transparent;

//   img {
//     position: absolute;
//     width: 100%;
//     height: 100%;
//     object-fit: contain;
//     object-position: center;

//     cursor: pointer;
//   }
// }
._header {
  padding: calc(var(--spacing) / 2) 0;
  cursor: pointer;
  overflow: hidden;

  // h2 {
  //   white-space: nowrap;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  // }
}
._generatePreviewBtn {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);
}

._previewProgress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(5px);

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
</style>
