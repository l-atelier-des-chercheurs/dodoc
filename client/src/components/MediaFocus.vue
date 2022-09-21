<template>
  <div class="_mediaFocus">
    <div
      :draggable="true"
      @dragstart="startMediaDrag($event)"
      @dragend="endMediaDrag()"
    >
      <MediaContent
        :file="file"
        :project_slug="project_slug"
        :resolution="1600"
      />
    </div>
    <sl-button-group class="_focusBtns">
      <sl-button size="small" @click="$emit('close')">Fermer</sl-button>
      <sl-button size="small" @click="$emit('remove')">Supprimer</sl-button>
    </sl-button-group>
  </div>
</template>
<script>
import MediaContent from "@/components/MediaContent.vue";

export default {
  props: {
    file: Object,
    project_slug: String,
  },
  components: {
    MediaContent,
  },
  data() {
    return {
      is_dragged: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    startMediaDrag($event) {
      console.log(`MediaFocus / startMediaDrag`);

      this.is_dragged = true;

      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "move";
      this.$eventHub.$emit(`mediadrag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      console.log(`MediaFocus / endMediaDrag`);
      this.$eventHub.$emit(`mediadrag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaFocus {
  position: relative;
  // padding: 1px;
  width: 100%;
  height: 100%;
  background: black;

  ::v-deep {
    ._mediaContent {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: auto;

      img {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }
}
</style>
