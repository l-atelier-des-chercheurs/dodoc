<template>
  <div class="_stackCarousel">
    <div class="_single">
      <transition name="pagechange" mode="out-in">
        <MediaContent
          v-if="current_file_shown"
          :key="current_file_shown.$path"
          :file="current_file_shown"
          :context="'full'"
          :resolution="1600"
          :show_fs_button="true"
          :zoom_on_click="true"
        />
      </transition>

      <div class="_dragFileIcon">
        <DragFile :file="current_file_shown" :is_dragged.sync="is_dragged" />
      </div>
    </div>
    <div class="_infos">
      <div class="u-spacingBottom">
        <TitleField
          :field_name="'caption'"
          class="_caption"
          :label="$t('caption')"
          :content="current_file_shown.caption"
          :path="current_file_shown.$path"
          :maxlength="1280"
          :input_type="'markdown'"
          :can_edit="can_edit"
        />
      </div>

      <div class="_btnRow">
        <div class="_removeFile">
          <sl-icon-button
            name="dash-square-dotted"
            @click="$emit('removeMediaFromStack', current_file_shown.$path)"
          />
          {{ $t("remove") }}
        </div>

        <select
          class="is--dark _changeOrderSelect"
          :value="active_file_index + 1"
          @change="
            $emit(
              'changeMediaOrder',
              active_file_index,
              +$event.target.value - 1
            )
          "
        >
          <option
            v-for="(a, i) in new Array(files.length).fill(null)"
            :key="i + 1"
            v-text="i + 1"
          />
        </select>
      </div>

      // remove media // reorder media // modifier légende // modifier sources
    </div>

    <transition-group tag="div" class="_list" name="listComplete">
      <div
        v-for="(file, index) in files"
        class="_preview"
        :data-iscurrent="current_file_shown.$path === file.$path"
        :key="file.$path"
        @click="toggleFile(index)"
      >
        <MediaContent :file="file" :context="'preview'" :resolution="360" />
      </div>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    files: Array,
    can_edit: Boolean,
  },
  components: {},
  data() {
    return {
      active_file_index: 0,
      is_dragged: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
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
  },
  methods: {
    toggleFile(index) {
      if (this.active_file_index === index) this.active_file_index = false;
      else this.active_file_index = index;
    },
    startMediaDrag($event) {
      this.is_dragged = true;
      $event.dataTransfer.setData("text/plain", JSON.stringify(this.file));
      $event.dataTransfer.effectAllowed = "copy";
      this.$eventHub.$emit(`mediatile.drag.start`);
    },
    endMediaDrag() {
      this.is_dragged = false;
      this.$eventHub.$emit(`mediatile.drag.end`);
    },
  },
};
</script>
<style lang="scss" scoped>
._stackCarousel {
  display: flex;
  flex-flow: column nowrap;

  > ._single {
    flex: 1 1 150px;
    height: 100px;
  }
  > ._infos {
    flex: 0 0 auto;
  }

  > ._list {
    flex: 0 0 auto;
  }
}

._single {
  position: relative;

  ._mediaContent {
    height: 100%;
  }
}

._infos {
  padding: calc(var(--spacing) * 2);
}

._list {
  display: flex;
  gap: 2px;
  overflow: auto;
  margin: 2px;
  // background: var(--c-gris_clair);
}
._preview {
  --thumb-size: 15vh;
  width: var(--thumb-size);
  height: var(--thumb-size);
  flex: 0 0 var(--thumb-size);

  background-color: rgba(0, 0, 0, 0.2);

  overflow: hidden;
  border-radius: 4px;
  cursor: pointer;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    transform: scale(0.95);
    background-color: rgba(0, 0, 0, 0.4);
  }

  &[data-iscurrent] {
    opacity: 0.5;
    pointer-events: none;
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

._dragFileIcon {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
