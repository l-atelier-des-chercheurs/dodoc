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

    <div class="_unfoldBtn">
      <button
        type="button"
        class="u-button u-button_icon u-button_transparent"
        @click="show_infos = !show_infos"
      >
        <b-icon
          v-if="show_infos"
          icon="chevron-compact-down"
          :aria-label="$t('close')"
        />
        <b-icon v-else icon="chevron-compact-up" :aria-label="$t('open')" />
        <b-icon icon="file-earmark-text" />
      </button>
    </div>

    <transition name="pagechange" mode="out-in">
      <div
        class="_infos"
        :data-hide="!show_infos"
        :key="current_file_shown.$path"
      >
        <div class="_infos--content">
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

          <div class="u-spacingBottom">
            <TitleField
              :field_name="'credits'"
              class="_credits"
              :label="$t('credits/source')"
              :content="current_file_shown.credits"
              :path="current_file_shown.$path"
              :maxlength="1280"
              :input_type="'markdown'"
              :can_edit="can_edit"
            />
          </div>

          <div class="u-instructions" v-if="current_file_shown.$location">
            {{ $t("latitude") }} : {{ current_file_shown.$location.latitude }}
            <br />
            {{ $t("longitude") }} : {{ current_file_shown.$location.longitude }}
          </div>
        </div>
      </div>
    </transition>

    <transition-group tag="div" class="_list" name="listComplete">
      <div
        v-for="(file, index) in files"
        class="_preview"
        :data-iscurrent="current_file_shown.$path === file.$path"
        :key="file.$path"
        @click="openFile(index)"
      >
        <MediaContent :file="file" :context="'preview'" :resolution="360" />

        <transition name="fade_fast" mode="out-in">
          <div class="_btnRow" v-if="current_file_shown.$path === file.$path">
            <RemoveMenu
              class="_removeBtn"
              :remove_text="$t('remove')"
              :show_button_text="false"
              @remove="$emit('removeMediaFromStack', current_file_shown.$path)"
            />
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
          </div>
        </transition>
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
      show_infos: true,
    };
  },
  i18n: {
    messages: {
      fr: {
        "credits/source": "Crédits/source",
      },
      en: {
        "credits/source": "Credits/source",
      },
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
    openFile(index) {
      this.active_file_index = index;
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

._unfoldBtn {
  width: 100%;
  border-top: 1px solid var(--sd-separator);
  z-index: 2;
  text-align: right;

  > button {
    width: 100%;
    justify-content: flex-end;
    border-radius: 0;

    &:hover,
    &:focus {
      background: var(--sd-separator);
    }
  }
}

._infos {
  position: relative;
  border-top: 1px solid var(--sd-separator);
  border-bottom: 1px solid var(--sd-separator);
  max-height: 50vh;
  overflow: auto;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);

  transition: all 0.02s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-hide] {
    max-height: 0;
    padding: 0 calc(var(--spacing) / 1);
  }
}

._list {
  display: flex;
  gap: 2px;
  overflow: auto;
  margin: 2px;
  // background: var(--c-gris_clair);
}
._preview {
  position: relative;

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
    // transform: scale(0.95);
    background: transparent;
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

._dragFileIcon {
  position: absolute;
  top: 0;
  right: 0;
}

._btnRow {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(5px);

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-content: center;
  align-items: center;
}

._removeBtn {
  position: absolute;
  top: 0;
  right: 0;
}

._changeOrderSelect {
  // position: absolute;
  // top: 0;
  // left: 0;
  margin: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 4);

  width: 5ch;
}
</style>
