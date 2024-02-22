<template>
  <div
    class="_chutierRow"
    :class="{
      'is--clicked': is_clicked,
      'is--selected': is_selected,
      'is--edited': edit_mode,
      'is--mousedown': is_mousedown,
      'is--dragged': is_dragged,
    }"
    :draggable="draggable"
    @dragstart="dragStart"
    @dragend="dragEnd"
    @click="!edit_mode ? $emit('toggleSelect') : ''"
    @mousedown="is_mousedown = true"
    @mouseup="is_mousedown = false"
  >
    <div class="_chutierRow--rows">
      <div class="_infos">
        <div class="_chutierRow--openLarge" @click.stop="show_large = true">
          <MediaContent
            class="_chutierRow--preview"
            :file="file"
            :context="'preview'"
          />
        </div>
        <div class="_titleDateField">
          <div>
            <div class="">
              <small>
                {{
                  context === "stack"
                    ? formatDateTimeToPrecise(date_created_corrected)
                    : formatTime(date_created_corrected, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                }}
              </small>
            </div>
            <div v-if="file.caption" v-text="file.caption" />
            <div v-else v-text="file.$media_filename" />
          </div>
        </div>
        <button type="button" class="u-button_icon _dragBtn">
          <b-icon :icon="'grid3x2-gap-fill'" rotate="90" />
        </button>
      </div>
    </div>
    <!-- <CollaborativeEditor2
          v-if="file.$type === 'text'"
            class="_content"
            :path="file.$path"
            :content="file.$content"
            :edit_on_mounted="true"
            :can_edit="true"
            :custom_formats="['bold', 'italic', 'underline', 'link']"
          /> -->

    <template v-if="show_large">
      <portal to="largemedia">
        <div class="_largePreview">
          <div class="_closeLarge">
            <button
              class="u-button u-button_icon u-button_transparent"
              @click="show_large = false"
            >
              <b-icon icon="x-lg" :label="$t('close')" />
            </button>
          </div>
          <FileShown
            class="_fileLarge"
            :key="file.$path"
            :context="'chutier'"
            :file="file"
            :can_edit="true"
          />
        </div>
      </portal>
    </template>
    <div class="anim_backgroundPosition" v-if="is_selected && false" />
  </div>
</template>
<script>
import FileShown from "@/components/archive/FileShown.vue";

export default {
  props: {
    file: Object,
    is_selected: Boolean,
    is_clicked: Boolean,
    draggable: Boolean,
    context: {
      type: String,
      default: "list",
    },
  },
  components: {
    FileShown,
  },
  data() {
    return {
      show_large: false,
      is_mousedown: false,
      edit_mode: false,
      is_dragged: false,

      id: `select_chutier_item_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      date_created_corrected: this.datetimeLocal(
        this.file.date_created_corrected ||
          this.file.$date_created ||
          this.file.$date_uploaded ||
          new Date()
      ),
      description: this.file.description || "",
      keywords: this.file.keywords || [],
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("chutierItem.editText", this.editText);
    this.$eventHub.$on("chutierItem.startDrag", this.itemDragged);
    this.$eventHub.$on("chutierItem.endDrag", this.itemStoppedDrag);
  },
  beforeDestroy() {
    this.$eventHub.$off("chutierItem.editText", this.editText);
    this.$eventHub.$off("chutierItem.startDrag", this.itemDragged);
    this.$eventHub.$off("chutierItem.endDrag", this.itemStoppedDrag);
  },
  watch: {},
  computed: {},
  methods: {
    cleanFilename() {
      return this.file.$media_filename.substring(
        0,
        this.file.$media_filename.lastIndexOf(".")
      );
    },
    editText(meta_filename) {
      if (this.getFilename(this.file.$path) === meta_filename) {
        this.show_large = true;
        this.$nextTick(() => {
          //
        });
      }
    },
    dragStart(event) {
      this.is_dragged = true;
      if (!this.is_selected) this.$emit("toggleSelect");
      this.$eventHub.$emit("chutierItem.startDrag");
      event.dataTransfer.effectAllowed = "move";

      var img = document.createElement("img");
      // img.src = this.makeMediaFileURL({
      //   $path: this.file.$path,
      //   $media_filename: this.file.$media_filename,
      // });

      const img_src = this.makeURLFromThumbs({
        $thumbs: this.file.$thumbs,
        $type: this.file.$type,
        $path: this.getParent(this.file.$path),
        resolution: 180,
      });
      if (img_src) {
        img.src = img_src;
        event.dataTransfer.setDragImage(img, 0, 0, 50, 50);
      }
      event.dataTransfer.setData("text/plain", JSON.stringify(this.file.$path));
    },
    dragEnd() {
      this.is_dragged = false;
      this.$eventHub.$emit("chutierItem.endDrag");
    },
    itemDragged() {
      if (this.is_selected) this.is_dragged = true;
    },
    itemStoppedDrag() {
      this.is_dragged = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._fields {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
  justify-content: center;
  padding: calc(var(--spacing) / 2);
}

._selectBox {
  // height: 70px;
  width: 20px;
  display: flex;
  place-content: center;
  cursor: pointer;
  color: var(--c-gris);

  display: none;

  input {
    cursor: inherit;
    --form-background: transparent !important;
    --form-control-color: var(--c-jaune);
    border-color: #555;
  }

  &:hover input {
    border: 2px solid var(--c-orange);
  }
}

._infos {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  justify-content: stretch;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  // padding-left: 1px;
  padding: 0 calc(var(--spacing) / 4);
  width: 100%;

  ._titleDateField {
    flex: 1 1 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

._chutierRow {
  position: relative;

  width: 100%;
  // padding: 2px;
  padding: calc(var(--spacing) / 4) 0;
  margin-bottom: -1px;
  overflow: hidden;
  // border-radius: 4px;
  border: 1px dashed transparent;
  color: hsl(257, 3%, 81%);

  // box-shadow: 0 0px 5px rgba(255 255 255 / 6%);
  // border: 1px solid transparent;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  @media (hover: hover) and (pointer: fine) {
    &:not(.is--selected):not(.is--edited):hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  // &.is--mousedown:not(.is--selected):not(.is--edited) {
  //   background: rgba(0, 0, 0, 0.2);
  // }

  &.is--dragged {
    transform: scale(0.93) rotate(1deg);
    opacity: 0.6;
  }

  &.is--selected,
  &.is--edited
  // &.is--clicked
  {
    color: hsl(257, 3%, 95%);
    border-color: hsl(257, 3%, 61%);
    background: hsl(257, 3%, 52%);

    &:hover {
      background: hsl(257, 3%, 55%);
    }
  }

  ._chutierRow--openLarge {
    display: block;
    cursor: pointer;
    // margin-right: calc(var(--spacing) / 2);

    &:hover {
      opacity: 0.8;
    }
  }

  ._chutierRow--rows {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }
  &:not(.is--edited) {
    cursor: pointer;
  }

  ._chutierRow--preview {
    position: relative;
    height: 60px;
    border-radius: 2px;
    width: 60px;
    flex: 0 0 auto;
    overflow: hidden;
    color: white;
    background: black;
    font-size: 70%;

    ::v-deep {
      ._mediaContent--image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .ql-container {
        font-size: 50%;
      }
    }
  }
}
._descriptionField {
  resize: vertical;
}

._publierBtn {
  text-align: center;
  margin: calc(var(--spacing) / 4) auto;
}

._content {
  ::v-deep {
    .ql-editor {
      background-color: hsl(0, 0, 21);
      border-color: white;
      color: white;
      padding: calc(var(--spacing) * 0.5);
    }
    ._editBtn {
      display: none;
    }
    .ql-toolbar.ql-toolbar {
      top: 50px;
      border-radius: 8px;

      display: flex;
      flex-flow: row wrap;
      justify-content: space-between;

      ._TEbtnContainer {
        width: auto;
        flex: 1 0 auto;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
._dragBtn {
  color: currentColor;
}

.anim_backgroundPosition {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
<style lang="scss">
._largePreview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  overflow: auto;

  background-color: var(--chutier-bg);

  display: flex;
  flex-flow: column nowrap;

  > ._closeLarge {
    flex: 0 0 auto;
  }
  > ._fileLarge {
    flex: 1 1 auto;
  }

  ._closeLarge {
    position: relative;
    border-bottom: 1px solid var(--sd-separator);
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
}
</style>
