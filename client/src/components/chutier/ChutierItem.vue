<template>
  <div
    class="_chutierRow"
    :class="{
      'can--toggleSelect': $listeners.toggleSelect,
      'is--clicked': is_clicked,
      'is--selected': is_selected,
      'is--dragged': is_dragged,
    }"
    :draggable="draggable"
    @dragstart="dragStart"
    @dragend="dragEnd"
    @click="$emit('toggleSelect')"
  >
    <div class="_chutierRow--rows">
      <div class="_infos">
        <div class="_chutierRow--previewMedia">
          <span @click.stop="show_large = true">
            <MediaContent
              class="_chutierRow--preview"
              :file="file"
              :context="'preview'"
            />
          </span>
          <div class="_actions" v-if="context !== 'show_only_thumbs'">
            <button
              type="button"
              class="u-button_icon _dragBtn"
              v-if="draggable"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.01864 7.20446C9.25889 7.20446 9.48929 7.29963 9.65918 7.46904C9.82906 7.63845 9.9245 7.86822 9.9245 8.1078V10.3644C9.9245 10.5241 9.98812 10.6773 10.1014 10.7902C10.2146 10.9031 10.3682 10.9666 10.5284 10.9666C10.6886 10.9666 10.8422 10.9031 10.9554 10.7902C11.0687 10.6773 11.1323 10.5241 11.1323 10.3644V7.82812C11.1323 7.25029 11.8264 7.14482 12.3513 7.25029C12.5131 7.28281 12.641 7.33835 12.7849 7.46904C12.8532 7.53111 12.944 7.73743 12.944 7.93858V10.3644C12.944 10.5241 13.0077 10.6773 13.1209 10.7902C13.2342 10.9031 13.3878 10.9666 13.5479 10.9666C13.7081 10.9666 13.8617 10.9031 13.975 10.7902C14.0882 10.6773 14.1518 10.5241 14.1518 10.3644V8.47938C14.1945 8.4749 14.2372 8.47089 14.2799 8.46733C14.6615 8.43843 14.9852 8.45529 15.135 8.51551C15.2775 8.57092 15.4974 8.76484 15.722 9.03343C15.8198 9.14906 15.9032 9.26228 15.9636 9.34538V10.9666C15.9636 11.1263 16.0272 11.2795 16.1405 11.3924C16.2537 11.5054 16.4073 11.5688 16.5675 11.5688C16.7276 11.5688 16.8813 11.5054 16.9945 11.3924C17.1078 11.2795 17.1714 11.1263 17.1714 10.9666V9.76212H17.5845C17.7533 9.76212 17.9202 9.7974 18.0745 9.86569C18.2288 9.93398 18.367 10.0338 18.4802 10.1586C18.5934 10.2834 18.6792 10.4306 18.7319 10.5905C18.7846 10.7504 18.8031 10.9195 18.7862 11.087L18.4589 14.3571C18.4166 14.7774 18.2862 15.184 18.076 15.5507L16.3911 18.492C16.3383 18.5842 16.262 18.6608 16.17 18.7141C16.0779 18.7674 15.9734 18.7955 15.8669 18.7955H8.15505C8.05559 18.7955 7.95769 18.7709 7.87004 18.7241C7.78239 18.6772 7.70769 18.6095 7.6526 18.5269L5.9218 15.9374C5.7611 15.6972 5.66045 15.4221 5.6283 15.1352L5.2116 11.3954C5.19476 11.2455 5.23493 11.0948 5.32417 10.973C5.4134 10.8512 5.54521 10.7673 5.69352 10.7377L6.90496 10.4968V11.5688C6.90496 11.7285 6.96859 11.8817 7.08184 11.9946C7.19509 12.1076 7.3487 12.171 7.50887 12.171C7.66903 12.171 7.82264 12.1076 7.93589 11.9946C8.04915 11.8817 8.11277 11.7285 8.11277 11.5688V8.1078C8.11277 7.86822 8.20821 7.63845 8.3781 7.46904C8.54798 7.29963 8.77839 7.20446 9.01864 7.20446ZM10.5284 6.75C10.132 6.35471 9.57922 6 9.01864 6C8.45805 6 7.92043 6.22207 7.52404 6.61736C7.12765 7.01265 6.90496 7.54878 6.90496 8.1078V9.2683L5.45558 9.55737C5.01132 9.64619 4.61656 9.89779 4.34915 10.2626C4.08175 10.6273 3.96111 11.0788 4.01103 11.5279L4.42773 15.2689C4.48132 15.7471 4.64906 16.2056 4.9169 16.6058L6.6477 19.1954C6.81312 19.4429 7.03726 19.6458 7.30021 19.7862C7.56317 19.9265 7.8568 20 8.15505 20H15.8669C16.1863 19.9999 16.4999 19.9156 16.7761 19.7557C17.0523 19.5958 17.2811 19.366 17.4395 19.0894L19.1244 16.1494C19.419 15.6354 19.6017 15.0654 19.6607 14.4764L19.988 11.2063C20.0216 10.8714 19.9844 10.5332 19.8789 10.2135C19.7734 9.89385 19.6019 9.59976 19.3755 9.35022C19.149 9.10068 18.8726 8.90123 18.5642 8.76472C18.2557 8.62821 17.9219 8.55768 17.5845 8.55767H16.8827C16.8073 8.45571 16.7288 8.35609 16.6472 8.25896C16.4165 7.98314 16.0312 7.57483 15.5843 7.39657C15.1447 7.22072 14.5625 7.23758 14.1857 7.26649L14.0262 7.28095C13.7453 6.56393 13.1227 6 12.0662 6C10.8923 6 10.5284 6.75 10.5284 6.75Z"
                  fill="#77758E"
                />
              </svg>
            </button>
            <input
              v-if="$listeners.toggleSelect"
              class="_checkbox"
              type="checkbox"
              v-model="is_selected"
            />
          </div>
        </div>
        <div class="_titleDateField" v-if="context !== 'show_only_thumbs'">
          <div>
            <div class="_tile_filename">
              <div
                class="u-filename _filename"
                v-if="file.$media_filename"
                :title="file.$media_filename"
              >
                {{ file.$media_filename }}
              </div>
              <div class="_time">
                {{
                  context === "stack"
                    ? formatDateTimeToPrecise(date_created_corrected)
                    : formatTime(date_created_corrected, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                }}
              </div>
            </div>

            <div class="_infos2">
              <div class="_labelLine">
                <b-icon icon="text-left" :aria-label="$t('caption')" />
                <DLabel :str="$t('caption')" />
              </div>

              <TitleField
                :label="$t('caption')"
                :show_label="false"
                :input_type="'editor'"
                :custom_formats="['bold', 'italic', 'link']"
                :field_name="'caption'"
                :content="file.caption"
                :path="file.$path"
                :maxlength="1280"
                :can_edit="false"
              />

              <!-- 
              <CollaborativeEditor3
                :field_to_edit="'caption'"
                :content="file.caption"
                :path="file.$path"
                :custom_formats="['bold', 'italic', 'link']"
                :is_collaborative="false"
                :maxlength="1280"
                :can_edit="true"
              /> -->
            </div>
            <div class="_infos2">
              <div class="_labelLine">
                <b-icon
                  icon="info-circle"
                  :aria-label="$t('credit/reference')"
                />
                <DLabel :str="$t('credit/reference')" />
              </div>
              <TitleField
                :label="$t('credit/reference')"
                :show_label="false"
                :input_type="'editor'"
                :custom_formats="['bold', 'italic', 'link']"
                :field_name="'$credits'"
                :content="file.$credits"
                :path="file.$path"
                :maxlength="1280"
                :can_edit="true"
              />
            </div>
          </div>
        </div>
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

    <BaseModal2
      v-if="show_large"
      size="full"
      @close="show_large = false"
      :nopadding="true"
    >
      <div class="_largePreview">
        <!-- <div class="_closeLarge">
            <button
              class="u-button u-button_icon u-button_transparent"
              @click="show_large = false"
            >
              <b-icon icon="x-lg" :label="$t('close')" />
            </button>
          </div> -->
        <FileShown
          class="_fileLarge"
          :key="file.$path"
          :context="'chutier'"
          :file="file"
          :can_edit="true"
        />
      </div>
    </BaseModal2>
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
._infos {
  flex: 1 1 auto;
  display: flex;
  flex-flow: row nowrap;
  // gap: calc(var(--spacing) / 2);
  // padding-left: 1px;
  // padding: 0 calc(var(--spacing) / 4);
  // border: 1px solid var(--h-50);
  width: 100%;

  ._titleDateField {
    flex: 1 1 0;
    height: 100%;
    overflow: hidden;
    padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  }
}

._actions {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: auto;
  padding: calc(var(--spacing) / 4);
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
  flex: 0 0 auto;

  input {
    background-color: white;
  }
}

._chutierRow {
  position: relative;
  // width: 100%;
  break-inside: avoid;
  padding: 1px;
  // padding: calc(var(--spacing) / 4) 0;
  overflow: hidden;
  border-radius: 3px;
  // color: var(--g-700);
  cursor: pointer;
  transform-origin: center center;

  transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

  &.can--toggleSelect {
    @media (hover: hover) and (pointer: fine) {
      &:hover:not(.is--selected) {
        background-color: var(--h-100);
      }
    }
  }

  &.is--dragged {
    transform: scale(0.93) rotate(1deg);
    opacity: 0.6;
  }

  &.is--selected {
    background-color: var(--h-200);
    color: var(--h-900);
    // transform: scale(0.98);

    &:hover {
    }
  }

  ._chutierRow--previewMedia {
    position: relative;
    display: block;
    cursor: pointer;
    // margin-right: calc(var(--spacing) / 2);
    // background-color: var(--h-200);
    transition: all 0.25s cubic-bezier(0.19, 1, 0.22, 1);

    &:hover {
      opacity: 0.8;
      // transform: scale(1.05);
    }
  }

  ._chutierRow--rows {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
  }

  ._chutierRow--preview {
    position: relative;
    height: 150px;
    width: 150px;
    border-radius: 2px;
    flex: 0 0 auto;
    overflow: hidden;
    // color: white;
    // background: black;
    background: var(--h-100);
    color: var(--h-200);

    display: block !important;
    text-align: left;

    font-size: var(--sl-font-size-small);

    ::v-deep {
      ._mediaContent--image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
      }
      .ql-container {
        padding: calc(var(--spacing) / 4);
        font-size: var(--sl-font-size-small);
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
      background-color: hsl(0, 0%, 21%);
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

._checkbox {
  // color: var(--h-500);
  // width: 20px;
  // height: 20px;
  border-radius: 4px;
  border: 1px solid var(--h-500);
  background-color: transparent;
  margin: 0;
  cursor: pointer;
}
._largePreview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  overflow: auto;
  --sd-separator: var(--h-200);

  // background-color: var(--chutier-bg);
  // color: white;

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

._infos2 {
  margin-top: calc(var(--spacing) / 1);
  margin-bottom: calc(var(--spacing) / 1);
  font-size: var(--sl-font-size-small);

  ._collaborativeEditor {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-height: 1.7rem;

    // height: 1.4em;
  }
}

._tile_filename {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);

  // margin-top: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 1);
}

._filename {
  font-size: var(--sl-font-size-x-small);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._time {
  font-size: var(--sl-font-size-x-small);
  // opacity: 0.5;
}
._labelLine {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  pointer-events: none;
}
</style>
