<template>
  <div class="_itemModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />
    <div class="_modalContent">
      <button
        type="button"
        class="u-button u-button_transparent _navBtn _closeButton"
        @click="$emit('close')"
      >
        <img
          :src="`${$root.publicPath}images/i_close_sansfond.svg`"
          width="2rem"
          height="2rem"
          class=""
        />
      </button>

      <div class="_topBar"></div>

      <div class="_bottomContent">
        <div class="_leftContent">
          <div
            v-if="current_file_shown"
            :key="current_file_shown.$path"
            class="_openedFile--media"
          >
            <MediaContent
              :file="current_file_shown"
              :context="'full'"
              :resolution="1600"
            />
          </div>

          <div
            v-if="file._stack_files"
            class="_navMedia"
            :data-layout="current_file_shown ? 'nav' : 'grid'"
          >
            <div
              v-for="(file, index) in file._stack_files"
              :key="file.$path"
              :class="{
                'is--shown': current_file_index_shown === index,
              }"
              @click="toggleFile(index)"
            >
              <MediaContent
                :file="file"
                :context="'preview'"
                :resolution="360"
              />
            </div>
          </div>

          <!-- <div class="_otherFromStacks">
            <sl-icon-button
              name="plus-circle"
              circle
              class="_appendMedia"
              disabled
            />
          </div> -->
        </div>
        <div class="_rightContent">
          {{ current_file_shown }}
          <DateDisplay
            v-if="file.date_created_corrected"
            :date="file.date_created_corrected"
          />

          <!-- media title or stack title -->
          <h1>
            {{ file.title }}
          </h1>
          <hr />
          <p>
            {{ file.description || "–" }}
          </p>
          <hr />
          <div
            class=""
            v-if="
              (file.keywords &&
                Array.isArray(file.keywords) &&
                file.keywords.length > 0) ||
              edit_mode
            "
          >
            <KeywordsField
              :edit_mode="edit_mode"
              :keywords="file.keywords"
              @cancelEdit="[]"
            />
          </div>

          {{ current_file_shown }}

          <sl-icon-button
            name="trash3"
            circle
            class="_removeBtn"
            @click="removeMedia(file.$path)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

export default {
  props: {
    file: Object,
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      current_file_index_shown: false,
      edit_mode: false,
    };
  },
  created() {},
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
  },
  watch: {},
  computed: {
    current_file_shown() {
      if (this.current_file_index_shown === false) return false;
      if (this.file._stack_files)
        return this.file._stack_files[this.current_file_index_shown];
      return this.file;
    },
  },
  methods: {
    removeMedia(path) {
      this.$api.deleteItem({ path });
    },
    handleKeyPress(event) {
      if (
        this.$root.modal_is_opened ||
        event.target.tagName.toLowerCase() === "input" ||
        event.target.tagName.toLowerCase() === "textarea" ||
        event.target.className.includes("ql-editor") ||
        event.target.hasAttribute("contenteditable")
      )
        return;

      if (event.key === "Escape") this.$emit("close");
    },
    toggleFile(index) {
      if (this.current_file_index_shown === index)
        this.current_file_index_shown = false;
      else this.current_file_index_shown = index;
    },
  },
};
</script>
<style lang="scss" scoped>
._itemModal {
  position: absolute;
  overflow: hidden;
  inset: 0;
  z-index: 10;

  --color-borders: var(--c-gris);
}

._modalContent {
  // position: absolute;
  // background: white;

  background: #efefef;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

._topBar {
  min-height: 50px;
  border-bottom: 1px solid var(--color-borders);
}

._bottomContent {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  height: 100%;
  overflow: hidden;

  > ._leftContent {
    flex: 10 1 auto;
  }
  > ._rightContent {
    flex: 1 0 240px;
  }
}

._leftContent {
  position: relative;
  // background: #d9d9d9;
  // padding: calc(var(--spacing) * 1) calc(var(--spacing) * 2);
  height: 100%;
  overflow: auto;

  display: flex;
  flex-flow: column nowrap;
}

._openedFile--media {
  flex: 1 1 auto;
  overflow: hidden;
  position: relative;
  margin: calc(var(--spacing) * 1);
}

._openedFile--media ::v-deep {
  ._mediaContent {
    // position: absolute;
    // width: 100%;
    // height: 100%;
    // pointer-events: auto;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;

    ._mediaContent--image {
      position: absolute;
      width: 100%;
      height: 100%;

      object-fit: contain;
      max-width: none;
    }
  }
}

._navMedia {
  position: relative;

  > * {
    position: relative;
    flex: 0 0 150px;
    width: 150px;
    height: 150px;
    cursor: pointer;
    padding: calc(var(--spacing) / 4);

    &:hover,
    &:focus {
      background: var(--c-gris);
    }

    &.is--shown {
      opacity: 0.7;
      background: var(--c-gris);
    }
  }

  ::v-deep {
    ._mediaContent {
      // position: absolute;
      // width: 100%;
      // height: 100%;
      // pointer-events: auto;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;

      ._mediaContent--image {
        position: absolute;
        width: 100%;
        height: 100%;

        object-fit: contain;
        max-width: none;
      }
    }
  }

  &[data-layout="nav"] {
    display: flex;
    flex-flow: row nowrap;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
    width: 100%;
    overflow: auto;
  }
  &[data-layout="grid"] {
    display: flex;
    flex-flow: row wrap;
    gap: calc(var(--spacing) / 2);
    padding: calc(var(--spacing) / 2);
  }
}

._date {
  margin-bottom: calc(var(--spacing) * 1);
}
._title {
}

._appendMedia {
  display: flex;
  align-content: center;
  justify-content: center;
  font-size: 175%;
}

._rightContent {
  padding: calc(var(--spacing) * 1);
  border-left: 1px solid var(--color-borders);
  height: 100%;
  overflow: auto;

  h1 {
    font-weight: 300;
    font-size: var(--sl-font-size-x-large);
  }
  hr {
    border-color: #cccccc;
    max-width: 50px;
    margin: calc(var(--spacing) * 2) 0;
  }
}

._closeButton {
  position: absolute;
  z-index: 10000;
  top: 0em;
  right: 0em;
  // color: currentColor;
  // font-size: 200%;
  // background: rgba(255, 255, 255, 0.25);
  // border-radius: 50%;

  padding: calc(var(--spacing) / 4);
  margin: 0;

  img {
    width: 2rem;
    height: 2rem;
  }

  // &:not(:hover) {
  //   margin-top: -10px;
  //   margin-right: -10px;
  // }
}
</style>
