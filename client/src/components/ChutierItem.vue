<template>
  <div
    class="_chutierRow"
    :class="{
      'is--clicked': is_clicked,
      'is--selected': is_selected,
      'is--edited': edit_mode,
      'is--mousedown': is_mousedown,
    }"
    @click="!edit_mode ? $emit('toggleSelect') : ''"
    @mousedown="is_mousedown = true"
    @mouseup="is_mousedown = false"
  >
    <div class="_chutierRow--rows">
      <div class="_infos">
        <label
          :for="id"
          class="_selectBox"
          @click.stop
          v-if="!edit_mode && $listeners && $listeners.toggleSelect"
        >
          <input
            type="checkbox"
            :checked="is_selected"
            :name="id"
            @change="$emit('toggleSelect')"
            :id="id"
          />
        </label>
        <div
          class="_chutierRow--openLarge"
          @click.stop="show_large = true"
          v-if="!(file.$type === 'text' && edit_mode)"
        >
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
                <template v-if="!edit_mode">
                  {{
                    formatTime(date_created_corrected, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </template>
                <template v-else>
                  <input
                    class="is--dark"
                    type="datetime-local"
                    v-model="date_created_corrected"
                    step="1"
                  />
                </template>
              </small>
            </div>

            <div v-if="!edit_mode">
              {{ text_title }}
            </div>

            <template v-else>
              <input
                type="text"
                class="is--dark"
                autofocus
                required
                v-model="text_title"
                placeholder="Titre"
                @keydown.enter.prevent="
                  context === 'stack' ? $emit('unclicked') : ''
                "
                @keydown.esc.prevent="cancelEdit"
              />
            </template>
          </div>
        </div>
        <EditBtn v-if="!edit_mode" @click="edit_mode = true" />
      </div>
    </div>
    <div
      class="_fields"
      v-if="
        context !== 'stack' &&
        (edit_mode || keywords.length > 0 || description.length > 0)
      "
    >
      <div v-if="edit_mode">
        <span class="u-instructions">
          Corrigez ou complétez le titre et les mots-clés pour partager cette
          pile.
        </span>
      </div>
      <div class="" v-if="description || edit_mode">
        <div v-if="!edit_mode">
          {{ description }}
        </div>

        <template v-else>
          <textarea
            v-if="file.$type !== 'text'"
            class="is--dark _descriptionField"
            v-model="description"
            placeholder="Description"
            @keydown.esc.prevent="cancelEdit"
          />
          <CollaborativeEditor2
            v-else
            class="_content"
            :path="file.$path"
            :content="file.$content || ''"
            :edit_on_mounted="true"
            :can_edit="true"
            :custom_formats="['bold', 'italic', 'underline', 'link']"
          />
        </template>
      </div>

      <div class="" v-if="(keywords && keywords.length > 0) || edit_mode">
        <KeywordsField
          :edit_mode="edit_mode"
          :keywords.sync="keywords"
          @cancelEdit="cancelEdit"
        />
      </div>

      <div class="_publierBtn">
        <button
          type="button"
          :key="share_button_is_enabled"
          class="u-buttonLink"
          :disabled="!share_button_is_enabled"
          @click="shareButtonClicked"
        >
          Publier&nbsp;
          <sl-icon name="arrow-right-square" style="font-size: 1rem" circle />
        </button>
      </div>
    </div>
    <div
      v-if="show_large"
      class="_chutierRow--largePreview"
      @click.self="show_large = false"
    >
      <MediaContent :file="file" :context="'full'" :resolution="1600" />
      <button
        type="button"
        class="u-button u-button_round u-button_black _closeBtn"
        @click="show_large = false"
      >
        <sl-icon name="x-lg" :label="$t('close')" />
      </button>
    </div>
  </div>
</template>
<script>
import KeywordsField from "@/components/KeywordsField.vue";

function datetimeLocal(datetime) {
  const dt = new Date(datetime);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
}

export default {
  props: {
    file: Object,
    is_selected: Boolean,
    is_clicked: Boolean,
    shared_space_path: String,
    context: {
      type: String,
      default: "list",
    },
  },
  components: {
    KeywordsField,
  },
  data() {
    return {
      opened_pane: undefined,
      show_large: false,
      is_mousedown: false,
      edit_mode: false,
      id: `select_chutier_item_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      text_title:
        this.file.title || this.cleanFilename(this.file.$media_filename) || "",
      date_created_corrected: datetimeLocal(
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
  mounted() {},
  beforeDestroy() {},
  watch: {
    "file.title"() {
      this.text_title = this.file.title;
    },
    is_clicked() {
      if (!this.is_clicked && this.edit_mode) {
        // todo save
        this.saveFields();
        this.edit_mode = false;
      }
    },
    edit_mode() {
      if (this.edit_mode)
        this.$nextTick(() => {
          this.$el.querySelector("[autofocus]").select();
        });
    },
  },
  computed: {
    share_button_is_enabled() {
      return this.text_title.length > 0 && this.keywords.length > 0;
    },
  },
  methods: {
    async moveToSharedSpace() {
      const path_to_destination_folder = this.shared_space_path;
      await this.$api.copyFile({
        path: this.file.$path,
        path_to_destination_folder,
        new_meta: {
          $authors: [this.connected_as.$path],
        },
      });
      await this.remove();
    },
    async remove() {
      this.$api.deleteItem({ path: this.file.$path });
    },
    cleanFilename() {
      return this.file.$media_filename.substring(
        0,
        this.file.$media_filename.lastIndexOf(".")
      );
    },
    cancelEdit() {
      this.text_title =
        this.file.title || this.cleanFilename(this.file.$media_filename) || "";
      this.date_created_corrected =
        this.file.date_created_corrected ||
        this.file.$date_created ||
        this.file.$date_uploaded ||
        "";
      this.description = this.file.description || "";
      this.keywords = this.file.keywords || "";
      this.edit_mode = false;
    },
    async shareButtonClicked() {
      if (this.share_button_is_enabled) {
        if (this.edit_mode) {
          await this.saveFields();
          await this.moveToSharedSpace();
          return;
        } else {
          await this.moveToSharedSpace();
        }
      } else {
        this.edit_mode = true;
      }
    },

    openLarge() {
      this.$emit("");
    },
    async saveFields() {
      // check if date is valid, if not then go back to previous date
      if (this.date_created_corrected === "")
        this.date_created_corrected =
          this.file.date_created_corrected ||
          this.file.$date_created ||
          this.file.$date_uploaded;

      await this.$api
        .updateMeta({
          path: this.file.$path,
          new_meta: {
            title: this.text_title,
            date_created_corrected: this.date_created_corrected,
            description: this.description,
            keywords: this.keywords,
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
          throw err;
        });
    },
    save() {},
    cancel() {
      this.edit_mode = false;
      // todo reset
    },
  },
};
</script>
<style lang="scss" scoped>
._catBtn {
  background: #ffbe32;
  border-radius: 5px;
  margin: 2px;
  padding: 2px;
}

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

  input {
    cursor: inherit;
  }

  &:hover input {
    border: 2px solid var(--c-orange);
  }
}

._infos {
  flex: 1 1 auto;
  display: flex;
  justify-content: stretch;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  // padding-left: 1px;
  margin: 0 calc(var(--spacing) / 2);

  ._titleDateField {
    flex: 1 1 auto;
  }
}

._chutierRow {
  width: 100%;
  // padding: 2px;
  padding: calc(var(--spacing) / 4) 0;
  margin-bottom: 2px;
  overflow: hidden;
  border-radius: 4px;
  // box-shadow: 0 0px 5px rgba(255 255 255 / 6%);
  // border: 1px solid transparent;

  transition: all 0.1s cubic-bezier(0.19, 1, 0.22, 1);

  &:not(.is--selected):hover {
    background: rgba(255, 255, 255, 0.05);
  }

  &.is--mousedown:not(.is--selected) {
    background: rgba(0, 0, 0, 0.2);
  }

  &.is--selected
  // &.is--clicked
  {
    // border-color: var(--c-orange);
    background: rgba(240, 240, 240, 0.1);
    // background: rgb(67, 69, 71);
    &:hover {
      background: rgba(255, 255, 255, 0.15);
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
    font-size: 50%;

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

  ._chutierRow--largePreview {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;

    // display: flex;
    // place-content: center;
    background: black;

    ::v-deep ._mediaContent {
      width: 100%;
      height: 100%;
      pointer-events: none;

      .u-floatingFsButton {
        display: none;
      }

      .plyr__control,
      ._mediaContent--pdfIframe {
        pointer-events: auto;
      }

      ._mediaContent--image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
      }

      .plyr__video-wrapper {
        pointer-events: none;
      }
    }

    ._closeBtn {
      position: absolute;
      top: 0;
      right: 0;
      margin: calc(var(--spacing) / 2);
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
  }
}
</style>
