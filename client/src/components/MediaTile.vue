<template>
  <div
    class="_mediaTile"
    :class="{
      'was--focused': was_focused,
      'is--dragged': is_dragged,
    }"
    draggable="true"
    @dragstart="startMediaDrag($event)"
    @dragend="endMediaDrag()"
  >
    <MediaContent :file="file" :resolution="220" />
    <span v-if="duration" class="u-meta">{{ duration }}</span>
    <span v-if="file.$type === 'pdf'" class="u-meta">{{ "pdf" }}</span>
    <span v-if="is_already_selected" class="_alreadySelected">
      <sl-icon name="check2-square" />
    </span>

    <button
      type="button"
      class="_focusMediaBtn"
      @click="$emit('toggleMediaFocus', file.$path)"
    />
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
    project_path: String,
    was_focused: Boolean,
    is_already_selected: Boolean,
  },
  components: {},
  data() {
    return { is_dragged: false };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    duration() {
      if (["video", "audio"].includes(this.file.$type))
        if (this.file.$infos.duration)
          return this.formatDurationToHoursMinutesSeconds(
            this.file.$infos.duration
          );
        else return "•:••";
      return false;
    },
  },
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
._mediaTile {
  position: relative;
  aspect-ratio: 1/1;
  background: rgba(255, 255, 255, 0.35);
  overflow: hidden;
  border-radius: 3px;

  // transition: all 1s 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  @supports not (aspect-ratio: 1/1) {
    width: 110px;
    height: 110px;
  }

  &.was--focused {
    // transform: translate3d(0, -5px, 0);
    border: 3px solid var(--c-noir);
    // background: rgba(51, 51, 51, 0.8);
  }
  &.is--dragged {
    opacity: 0.5;
  }

  &[data-type="text"],
  &[data-type="other"] {
    display: flex;
    justify-content: center;
    align-items: center;

    text-align: center;
  }

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

._focusMediaBtn {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  background: transparent;
  opacity: 0.3;
  transition: all 0.1s linear;

  &:hover {
    background: white;
    // background: rgba(255, 255, 255, 0.35);
    transition: none;
  }
}

.u-meta {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.7);
  padding: 0 calc(var(--spacing) / 4);
}

._alreadySelected {
  position: absolute;
  top: 0;
  left: 0;
  margin: calc(var(--spacing) / 2);
  background: var(--c-bleuvert);
  line-height: 0;
  padding: calc(var(--spacing) / 4);
  border-radius: 50%;
  font-size: 80%;
}
</style>