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
          <b-icon icon="arrow-left-square" />
        </button>

        <div class="_title">
          {{ $t("document") }} {{ opened_file_sequence }}
          &nbsp;
          <button
            type="button"
            class="u-button u-button_transparent u-button_icon _closeButton"
            @click="$emit('close')"
          >
            <b-icon icon="x-circle" />
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
          <b-icon icon="arrow-right-square" />
        </button>
      </div>

      <div class="_bottomContent">
        <div class="_leftContent">
          <div
            v-if="file.is_stack && file._stack_files.length === 0"
            class="u-instructions _noContentNotice"
          >
            {{ $t("no_content") }}
          </div>
          <div
            v-if="current_file_shown"
            :key="current_file_shown.$path"
            class="_openedFile--media"
          >
            <MediaContent
              :file="current_file_shown"
              :context="'full'"
              :resolution="1600"
              :show_fs_button="true"
              :zoom_on_click="true"
            />
          </div>

          <div class="_navArrow" v-if="current_file_shown && file._stack_files">
            <button
              type="button"
              class="u-button u-button_icon"
              :disabled="current_file_index_shown === 0"
              @click="prevItemInStack"
            >
              <b-icon icon="arrow-left-circle-fill" />
            </button>
            <span>
              {{ file_sequence_in_stack }}
            </span>
            <button
              type="button"
              class="u-button u-button_icon"
              :disabled="
                current_file_index_shown >= file._stack_files.length - 1
              "
              @click="nextItemInStack"
            >
              <b-icon icon="arrow-right-circle-fill" />
            </button>
          </div>

          <div
            v-if="file.is_stack"
            class="_navMedia"
            :data-layout="current_file_shown ? 'nav' : 'grid'"
          >
            <template v-for="(file, index) in file._stack_files">
              <div
                v-if="!file || !file.$path"
                :key="'no-content-' + index"
                v-text="'error: missing file'"
              />
              <div
                v-else
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
            </template>
          </div>

          <!-- <div class="_otherFromStacks">
            <sl-icon-button
              name="plus-circle"
              circle
              class="_appendMedia"
              disabled
            />
          </div> -->

          <button
            type="button"
            class="u-button u-button_icon _toggleSidebarBtn"
            @click="toggleSidebar"
          >
            <template v-if="show_sidebar">
              <b-icon icon="list" />
            </template>
            <template v-else>
              <b-icon icon="list" />
              <!-- &nbsp;
              {{ $t("informations") }} -->
            </template>
          </button>
        </div>
        <!-- <transition name="pagechange" mode="out-in"> -->
        <div class="_rightContent" v-if="show_sidebar">
          <button class="u-button u-button_red" @click="convertToFolder">
            CONVERTIR
          </button>

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
        <!-- </transition> -->
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
      current_file_index_shown: false,
      show_sidebar: localStorage.getItem("show_sidebar") !== "false",
    };
  },
  created() {},
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
    this.toggleFile(0);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
  },
  watch: {
    show_sidebar() {
      localStorage.setItem("show_sidebar", this.show_sidebar);
    },
  },
  computed: {
    current_file_shown() {
      if (this.file.is_stack)
        if (this.current_file_index_shown === false) return false;
        else {
          const file_to_show =
            this.file._stack_files[this.current_file_index_shown];
          if (file_to_show) return file_to_show;
          else {
            // eslint-disable-next-line
            // this.current_file_index_shown = false;
            return false;
          }
        }
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
    toggleSidebar() {
      this.show_sidebar = !this.show_sidebar;
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
      if (event.key === "ArrowLeft") this.prevItemInStack();
      if (event.key === "ArrowRight") this.nextItemInStack();
    },
    toggleFile(index) {
      if (this.current_file_index_shown === index)
        this.current_file_index_shown = false;
      else this.current_file_index_shown = index;
    },
    prevItemInStack() {
      const new_index = this.current_file_index_shown - 1;
      if (new_index >= 0) this.toggleFile(new_index);
    },
    nextItemInStack() {
      const new_index = this.current_file_index_shown + 1;
      if (new_index < this.file._stack_files.length) this.toggleFile(new_index);
    },
    async convertToFolder() {
      const additional_meta = {};

      if (this.file.title) {
        additional_meta.title = this.file.title;
        additional_meta.requested_slug = this.file.title;
      }
      if (this.file.keywords) additional_meta.keywords = this.file.keywords;
      if (this.file.date_created_corrected)
        additional_meta.date_created_corrected =
          this.file.date_created_corrected;
      if (this.file.description)
        additional_meta.description = this.file.description;
      if (this.file.stack_files_metas)
        additional_meta.stack_files_metas = this.file.stack_files_metas;

      additional_meta.$admins = "everyone";

      if (this.file.$admins) additional_meta.$authors = this.file.$admins;

      const slug = await this.$api.createFolder({
        path: "/folders/untitled/stacks",
        additional_meta,
      });
      slug;
      debugger;
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
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}

._bottomContent {
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
  height: 100%;
  overflow: hidden;

  > ._leftContent {
    flex: 3 1 0;
  }
  > ._rightContent {
    flex: 1 0 0px;
    min-width: 200px;
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
  // background: white;
  // margin: calc(var(--spacing) * 1);
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
      padding: calc(var(--spacing) / 1) calc(var(--spacing) / 1);
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

._navArrow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--spacing) / 4);

  > * {
    line-height: 0;
    display: block;
    // line-height: 1;
    // width: 2em;
    // height: 2em;
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
      opacity: 0.5;
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

._toggleSidebarBtn {
  position: absolute;
  top: 0;
  right: 0;
  border: 1px solid var(--color-borders);
  border-right: 0;
  margin: calc(var(--spacing) * 1);
  margin-right: 0;
  border-radius: 0;
  background: var(--c-gris_clair);

  &:hover:not([disabled]),
  &:active:not([disabled]),
  &:focus-visible:not([disabled]),
  &.is--active:not([disabled]) {
    background: white;
  }
}

._noContentNotice {
  width: 100%;
  height: 100%;
  display: flex;
  place-content: center;
  place-items: center;
}
</style>
