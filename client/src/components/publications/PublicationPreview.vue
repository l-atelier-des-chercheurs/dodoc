<template>
  <div class="u-card _publicationPreview">
    <!-- <img :src="`${$root.publicPath}${image_name}`" class="" /> -->
    <div class="">
      <div class="_projectInfos--cover">
        <img :src="cover_thumb" />
        <transition name="fade_fast" :duration="150" mode="out-in">
          <LoaderSpinner v-if="is_making_preview" />
        </transition>
        <button
          type="button"
          class="u-button u-button_small u-button_black _generatePreviewBtn"
          v-if="can_edit && !is_making_preview"
          @click="generatePreview"
        >
          <!-- <sl-icon name="card-image" /> -->
          <sl-icon name="arrow-clockwise" />
          <!-- {{ $t("generate_preview") }} -->
        </button>
      </div>
    </div>

    <header class="_header" @click="$emit('open')">
      <h2>
        {{ publication.title }}
      </h2>
      <small v-if="publication.template" v-html="$t(publication.template)" />
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

    <!-- {{ publication.title }} -->
    <!-- <button type="button" @click="removePublication">Supprimer</button> -->
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    type: String,
    image_name: String,
    publication: Object,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      is_making_preview: false,
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
  },
  methods: {
    async removePublication() {
      await this.$api.deleteItem({ path: this.publication.$path });
    },
    async generatePreview() {
      const instructions = {
        recipe: "png",
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
      };

      this.is_making_preview = true;
      const current_task_id = await this.$api.generatePreviewForPublication({
        path: this.publication.$path,
        instructions,
      });

      const checkIfEnded = ({ task_id }) => {
        if (task_id !== current_task_id) return;
        this.is_making_preview = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
  },
};
</script>
<style lang="scss" scoped>
._publicationPreview {
  width: 100%;
  padding: var(--spacing);
}
._publicationPreview header {
  cursor: pointer;
}
._projectInfos--cover {
  position: relative;
  aspect-ratio: 1/1;
  background: var(--c-gris);
  border: 2px solid transparent;

  img {
    position: absolute;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }
}
._header {
  padding: calc(var(--spacing) / 2) 0;
}
._generatePreviewBtn {
  position: absolute;
  top: 0;
  right: 0;
  margin: calc(var(--spacing) / 4);
}
</style>
