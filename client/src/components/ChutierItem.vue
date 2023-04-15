<template>
  <div
    class="_chutierRow"
    :class="{
      'is--clicked': is_clicked,
    }"
  >
    <div class="_chutierRow--rows">
      <div class="u-sameRow _infos">
        <label
          :for="id"
          class="_selectBox"
          v-if="$listeners && $listeners.toggleSelect"
        >
          <input
            type="checkbox"
            :checked="is_selected"
            :name="id"
            @change="$emit('toggleSelect')"
            :id="id"
          />
        </label>
        <div class="_chutierRow--openLarge" @click="show_large = true">
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
                placeholder="Remplir pour partager"
                @keydown.enter.prevent="
                  context === 'stack' ? $emit('unclicked') : ''
                "
                @keydown.esc.prevent="cancelEdit"
              />
            </template>
          </div>
        </div>
        <EditBtn v-if="!edit_mode" @click="edit_mode = true" />
        <sl-button
          variant="edit"
          v-else
          class="editBtn"
          size="small"
          circle
          @click="$emit('unclicked')"
        >
          <sl-icon name="check-circle" :label="$t('edit')" />
        </sl-button>
      </div>
      <transition name="scaleInFade" mode="out-in">
        <sl-icon-button
          v-if="shared_space_path"
          :key="share_button_is_enabled"
          class="u-shareBtn"
          :class="{
            'is--disabled': !share_button_is_enabled,
          }"
          name="arrow-right-square"
          style="font-size: 1rem"
          :label="$t('share')"
          circle
          @click="shareButtonClicked"
        />
      </transition>
    </div>
    <div
      class="_keywords"
      v-if="
        context !== 'stack' &&
        (edit_mode || keywords.length > 0 || description.length > 0)
      "
    >
      <div class="" v-if="description || edit_mode">
        <div v-if="!edit_mode">
          {{ description }}
        </div>
        <input
          v-else
          type="text"
          class="is--dark"
          v-model="description"
          placeholder="Description"
          @keydown.esc.prevent="cancelEdit"
        />
      </div>

      <div class="" v-if="keywords || edit_mode">
        <KeywordsField
          :edit_mode="edit_mode"
          :keywords.sync="keywords"
          @cancelEdit="cancelEdit"
        />
      </div>
    </div>
    <div
      v-if="show_large"
      class="_chutierRow--largePreview"
      @click="show_large = false"
    >
      <MediaContent :file="file" :context="'full'" :resolution="1600" />
      <sl-button
        variant="default"
        size="medium"
        class="_closeBtn"
        circle
        @click="show_large = false"
      >
        <sl-icon name="x-lg" :label="$t('close')"></sl-icon>
      </sl-button>
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
      edit_mode: false,
      id: `select_chutier_item_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,

      text_title:
        this.file.title || this.cleanFilename(this.file.$media_filename) || "",
      date_created_corrected: datetimeLocal(
        this.file.date_created_corrected ||
          this.file.$date_created ||
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
      const destination_path_to_folder = this.shared_space_path;
      await this.$api.copyFile({
        path: this.file.$path,
        destination_path_to_folder,
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
        this.file.date_created_corrected || this.file.$date_created || "";
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

._keywords {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  justify-content: center;
  padding: calc(var(--spacing) / 2);
}

._selectBox {
  height: 70px;
  width: 35px;
  display: flex;
  place-content: center;
  cursor: pointer;

  &:hover {
    background: black;
  }

  input {
    cursor: inherit;
  }
}

._infos {
  gap: 0;
}

._chutierRow {
  width: 100%;
  // padding: 2px;
  margin-bottom: 2px;
  background: rgb(37, 39, 41);
  box-shadow: 0 0px 5px rgba(255 255 255 / 6%);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgb(67, 69, 71);

  &.is--clicked {
    background: rgb(67, 69, 71);
  }

  ._chutierRow--openLarge {
    display: block;
    cursor: pointer;
    margin-right: calc(var(--spacing) / 2);

    &:hover {
      opacity: 0.8;
    }
  }

  ._chutierRow--rows {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
    align-items: center;
    // gap: calc(var(--spacing) / 2);

    ._infos {
      flex: 1 1 auto;
      display: flex;
      justify-content: stretch;

      ._titleDateField {
        flex: 1 1 auto;
      }
    }
  }

  ._chutierRow--preview {
    position: relative;
    height: 70px;
    border-radius: 2px;
    width: 70px;
    flex: 0 0 auto;
    overflow: hidden;

    ::v-deep ._mediaContent--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
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

      .u-floatingFsButton {
        display: none;
      }

      ._mediaContent--image {
        width: 100%;
        height: 100%;
        object-fit: contain;
        object-position: center;
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
</style>
