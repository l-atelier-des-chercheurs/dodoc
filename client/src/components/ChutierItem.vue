<template>
  <div
    class="u-chutierItem"
    :class="{
      'is--clicked': is_clicked,
    }"
  >
    <div class="u-chutierItem--rows">
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
        <div class="u-chutierItem--openLarge" @click="show_large = true">
          <MediaContent
            class="u-chutierItem--preview"
            :file="file"
            :context="'preview'"
          />
        </div>
        <div class="_titleDateField">
          <div>
            <div class="">
              <small @click="edit_mode = true">
                <template v-if="!edit_mode">
                  {{ formatDateToPrecise(date_created_corrected) }}
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
            {{ date_created_corrected }}

            <div v-if="!edit_mode" @click="edit_mode = true">
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
      v-if="context !== 'stack' && (edit_mode || keywords || description)"
    >
      <div v-if="!edit_mode">
        <div class="" v-if="description">
          {{ description }}
        </div>
        <div class="" v-if="keywords">
          <span class="u-button u-button_orange">
            {{ keywords }}
          </span>
        </div>
      </div>
      <template v-else>
        <input
          type="text"
          class="is--dark"
          v-model="description"
          placeholder="Description"
          @keydown.esc.prevent="cancelEdit"
        />
        <input
          type="text"
          class="is--dark"
          required
          v-model="keywords"
          placeholder="Mot-clé, matériaux, lieux, etc."
          @keydown.esc.prevent="cancelEdit"
        />

        <span class="u-instructions" v-if="keywords.length === 0">
          Corrigez ou complétez le titre et les mots-clés pour partager ce
          document.
        </span>

        <div class="_suggestions" v-else></div>
      </template>
    </div>
    <div
      v-if="show_large"
      class="u-chutierItem--largePreview"
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
  components: {},
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
      keywords: this.file.keywords || "",
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
  padding: calc(var(--spacing) / 2);

  justify-content: center;
}

._selectBox {
  height: 70px;
  display: flex;
  place-content: center;
  cursor: pointer;
}
</style>
