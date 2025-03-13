<template>
  <div class="_stackCarousel">
    <FileShown
      class="_stackCarousel--fileshown"
      :key="current_file_shown.$path"
      :file="current_file_shown"
      :position="file_shown_position"
      :can_edit="can_edit"
    />

    <transition-group tag="div" class="_list" name="listComplete">
      <div
        v-for="(file, index) in files"
        class="_preview"
        :data-iscurrent="current_file_shown.$path === file.$path"
        :key="file.$path"
        @click="openFile(index)"
      >
        <MediaContent :file="file" :context="'preview'" :resolution="360" />

        <transition name="fade" mode="out-in">
          <div class="_btnRow" v-if="current_file_shown.$path === file.$path">
            <div class="_previewOverlay" />
            <select
              class="_changeOrderSelect"
              size="small"
              :value="index + 1"
              @change="
                $emit('changeMediaOrder', index, +$event.target.value - 1)
              "
            >
              <option
                v-for="(a, i) in new Array(files.length).fill(null)"
                :key="i + 1"
                v-text="i + 1"
              />
            </select>
            <RemoveMenu
              class="_removeBtn"
              :remove_text="$t('remove')"
              :show_button_text="false"
              @remove="$emit('removeMediaFromStack', current_file_shown.$path)"
            />
          </div>
        </transition>

        <div class="_credits">
          <b-icon v-if="file.caption" icon="text-left" />
          <b-icon v-if="file.$credits" icon="info-circle" />
        </div>
      </div>
    </transition-group>
  </div>
</template>
<script>
import FileShown from "@/components/archive/FileShown.vue";

export default {
  props: {
    files: Array,
    can_edit: Boolean,
  },
  components: {
    FileShown,
  },
  data() {
    return {
      active_file_index: 0,
      is_dragged: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
      en: {},
    },
  },
  created() {},
  mounted() {
    this.$eventHub.$on("carousel.next", this.nextFile);
    this.$eventHub.$on("carousel.prev", this.prevFile);
  },
  beforeDestroy() {
    this.$eventHub.$off("carousel.next", this.nextFile);
    this.$eventHub.$off("carousel.prev", this.prevFile);
  },
  watch: {
    active_file_index() {
      this.$nextTick(() => {
        const current_file = this.$el.querySelector(
          "._preview[data-iscurrent]"
        );
        current_file.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      });
    },
  },
  computed: {
    enable_drag() {
      // hacky but it works
      return (
        typeof this.$eventHub._events["mediatile.drag.end"] !== "undefined"
      );
    },
    current_file_shown() {
      if (this.active_file_index !== false)
        return this.files[this.active_file_index];
      return false;
    },
    file_shown_position() {
      if (this.files.length === 1) return "alone";
      if (this.active_file_index === 0) return "first";
      if (this.active_file_index === this.files.length - 1) return "last";
      return "inbetween";
    },
  },
  methods: {
    toggleFile(index) {
      if (this.active_file_index === index) this.active_file_index = false;
      else this.active_file_index = index;
    },
    openFile(index) {
      this.active_file_index = index;
    },
    prevFile() {
      if (this.active_file_index > 0) this.active_file_index--;
    },
    nextFile() {
      if (this.active_file_index < this.files.length - 1)
        this.active_file_index++;
    },
  },
};
</script>
<style lang="scss" scoped>
._stackCarousel {
  display: flex;
  flex-flow: column nowrap;

  > ._stackCarousel--fileshown {
    flex: 1 1 auto;
  }

  > ._list {
    flex: 0 0 auto;
  }
}

._list {
  display: flex;
  gap: 2px;
  overflow: auto;
  padding: 2px;
  border-top: 1px solid var(--sd-separator);
}
._preview {
  position: relative;

  --thumb-size: 15vh;
  width: var(--thumb-size);
  height: var(--thumb-size);
  flex: 0 0 var(--thumb-size);

  background-color: var(--c-gris);

  overflow: hidden;
  border-radius: 4px;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    // transform: scale(0.95);
    background: transparent;
  }

  &:not([data-iscurrent]) {
    cursor: pointer;
  }

  &[data-iscurrent] {
    // opacity: 0.25;
    // pointer-events: none;
  }

  ._mediaContent {
    height: 100%;

    ::v-deep ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;
      object-fit: contain;
      max-width: none;
    }
  }
}

._btnRow {
  position: absolute;
  inset: 0;

  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-content: center;
  align-items: flex-start;
}

._previewOverlay {
  position: absolute;
  inset: 0;
  background-color: var(--h-700);
  opacity: 0.9;
}

._removeBtn {
  position: relative;
  // position: absolute;
  // top: 0;
  // right: 0;
  margin: calc(var(--spacing) / 2);
}

._changeOrderSelect {
  margin: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);

  width: 5ch;
}
._credits {
  position: absolute;
  bottom: 0;
  right: 0;
  margin: calc(var(--spacing) / 2);

  pointer-events: none;

  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
}
</style>
