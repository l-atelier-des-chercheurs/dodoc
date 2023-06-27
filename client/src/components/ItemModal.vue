<template>
  <div class="_itemModal">
    <div class="_mediaModal--overlay" @click="$emit('close')" />
    <div class="_modalContent">
      <div class="_topBar">
        <button
          type="button"
          class="u-button u-button_transparent u-button_icon _leftArrow"
          :disabled="
            position_in_list === 'first' || position_in_list === 'alone'
          "
          @click="$emit('prevMedia')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z"
              style="fill: var(--c-noir)"
            />
          </svg>
        </button>

        <div class="_title">
          {{ $t("document") }} {{ opened_file_sequence }}

          <button
            type="button"
            class="u-button u-button_transparent u-button_icon _closeButton"
            @click="$emit('close')"
          >
            <b-icon icon="x" />
          </button>
        </div>

        <button
          type="button"
          class="u-button u-button_transparent u-button_icon _rightArrow"
          :disabled="
            position_in_list === 'last' || position_in_list === 'alone'
          "
          @click="$emit('nextMedia')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
            <path
              d="M78.31,117l14.07-15.31a65.3,65.3,0,0,1,6.15-6.15,47.52,47.52,0,0,1,6.29-4.37H34.17V75.29h70.65a39.1,39.1,0,0,1-6.08-4.37q-2.8-2.46-6.36-6.15L78.31,49.46l13-11.07L131.6,83.21,91.29,128Z"
              style="fill: #353535"
            />
          </svg>
        </button>
      </div>

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
            v-if="file.is_stack"
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
          <FileMeta
            :file="file"
            :sequence="file_sequence_in_stack"
            :is_stack="file.is_stack"
            :stack_file_shown="current_file_shown"
            @removeMain="removeMain"
            @removeCurrent="removeCurrent"
            @closeStack="current_file_index_shown = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import FileMeta from "@/components/FileMeta.vue";

export default {
  props: {
    file: Object,
    opened_file_sequence: [Boolean, String],
    position_in_list: String,
  },
  components: {
    FileMeta,
  },
  data() {
    return {
      current_file_index_shown: 0,
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
      if (this.file.is_stack)
        if (this.current_file_index_shown === false) return false;
        else return this.file._stack_files[this.current_file_index_shown];
      return this.file;
    },
    file_sequence_in_stack() {
      if (this.file.is_stack)
        return `${this.current_file_index_shown + 1}/${
          this.file._stack_files.length
        }`;
      return false;
    },
  },
  methods: {
    async removeMain() {
      if (this.file.is_stack) {
        this.current_file_index_shown = false;
        await this.$api.deleteItem({ path: this.file.$path });
        for (const file of this.file._stack_files) {
          await this.$api.deleteItem({ path: file.$path });
        }
      } else {
        // otherwise, just remove media
        await this.$api.deleteItem({ path: this.file.$path });
      }
      this.$emit("close");
    },
    async removeCurrent() {
      // stack_files_metas
      let _stack_files_metas = this.file.stack_files_metas;
      _stack_files_metas = _stack_files_metas.filter(
        (sm) => sm !== this.getFilename(this.current_file_shown.$path)
      );

      await this.$api.updateMeta({
        path: this.file.$path,
        new_meta: {
          stack_files_metas: _stack_files_metas,
        },
      });
      await this.$api.deleteItem({ path: this.current_file_shown.$path });
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
  --modal-background: #efefef;
}

._modalContent {
  // position: absolute;
  // background: white;

  background: var(--modal-background);
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
}

._topBar {
  position: relative;
  min-height: 50px;
  border-bottom: 1px solid var(--color-borders);
  padding: calc(var(--spacing) / 2);

  display: flex;
  justify-content: space-between;
  align-items: center;
}

._bottomContent {
  display: flex;
  flex-flow: row wrap;
  align-items: stretch;
  height: 100%;
  overflow: hidden;

  > ._leftContent {
    flex: 3 1 0;
  }
  > ._rightContent {
    flex: 1 0 0px;
    min-width: 240px;
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

    &[data-filetype="text"] {
      display: block;
      overflow: auto;
    }

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

._appendMedia {
  display: flex;
  align-content: center;
  justify-content: center;
  font-size: 175%;
}

._rightContent {
  position: relative;
  border-left: 1px solid var(--color-borders);
  height: 100%;
}

._closeButton {
  // position: absolute;
  // z-index: 10000;
  // top: 0em;
  // right: 0em;
  // color: currentColor;
  // font-size: 200%;
  // background: rgba(255, 255, 255, 0.25);
  // border-radius: 50%;

  padding: calc(var(--spacing) / 4);
  margin: 0;

  img {
    width: 1.5rem;
    height: 1.5rem;
  }

  // &:not(:hover) {
  //   margin-top: -10px;
  //   margin-right: -10px;
  // }
}

._title {
  display: flex;
}
</style>
