<template>
  <ChutierPane @close="$emit('close')">
    <LoaderSpinner v-if="!stack" class="_loader" />
    <div v-else class="_mediaFocus">
      <MediaContent
        v-if="stack.$preview"
        :file="stack.$preview"
        context="preview"
      />

      <div class="_fileStack">
        <transition-group tag="div" class="_itemsList" name="listComplete">
          <div
            class="u-sameRow"
            v-for="(file, index) in stack_files_in_order"
            :key="file.$path"
          >
            <div class="_removeFile">
              <sl-icon-button
                name="dash-square-dotted"
                @click="removeMediaFromStack(file.$path)"
              />
            </div>

            <select
              class="is--dark _changeOrderSelect"
              :value="index + 1"
              @change="changeMediaOrder(index, +$event.target.value - 1)"
            >
              <option
                v-for="(a, i) in new Array(stack_files_in_order.length).fill(
                  null
                )"
                :key="i + 1"
                v-text="i + 1"
              />
            </select>
            <ChutierItem :file="file" :is_selected="false" :context="'stack'" />
          </div>
        </transition-group>
      </div>

      <div class="_fields">
        <small>
          <input
            class="is--dark"
            type="datetime-local"
            v-model="date_created_corrected"
            step="1"
          />
        </small>

        <DateField
          :field_name="'date_created_corrected'"
          :label="$t('date_created')"
          :date="date_created_corrected"
          :path="stack.$path"
          :input_type="'datetime-local'"
          :can_edit="true"
        />

        <span class="u-instructions">
          {{ $t("complete_or_correct_title_kw") }}
        </span>

        <TitleField
          :label="$t('title')"
          :field_name="'title'"
          :content="stack.title"
          :path="stack.$path"
          :input_type="'markdown'"
          :can_edit="true"
        />

        <KeywordsField
          :label="$t('keywords')"
          :field_name="'keywords'"
          :content="stack.keywords"
          :path="stack.$path"
          :can_edit="true"
        />

        <TitleField
          :label="$t('description')"
          :field_name="'description'"
          :content="stack.description"
          :path="stack.$path"
          :input_type="'markdown'"
          :can_edit="true"
        />
      </div>

      <div class="_shareBtn">
        <div v-if="!shared_folder_path">
          ERREUR : le dossier des contenus n'est pas disponible
        </div>
        <button
          type="button"
          v-else
          :key="share_button_is_enabled"
          class="u-button u-button_bleuvert"
          @click="shareButtonClicked"
        >
          <!-- :disabled="!share_button_is_enabled" -->
          {{ $t("publish") }}&nbsp;
          <sl-icon name="arrow-right-square" style="font-size: 1rem" circle />
        </button>
      </div>

      <hr />

      <div class="_shareBtn">
        <RemoveMenu :remove_text="$t('remove_stack')" @remove="removeStack" />
        <button type="button" class="u-buttonLink" @click="$emit('close')">
          {{ $t("save_as_draft") }}
        </button>
      </div>
    </div>
  </ChutierPane>
</template>
<script>
import ChutierPane from "@/components/chutier/ChutierPane.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import ChutierItem from "@/components/chutier/ChutierItem.vue";

export default {
  props: {
    stack_path: String,
  },
  components: {
    ChutierPane,
    KeywordsField,
    ChutierItem,
  },
  inject: {
    $sharedFolderPath: {
      default: false,
    },
  },
  i18n: {
    messages: {
      fr: {
        save_as_draft: "Enregistrer en brouillon",
      },
      en: {
        save_as_draft: "Save draft",
      },
    },
  },
  data() {
    return {
      stack: undefined,
      title: "",
      description: "",
      keywords: [],
      date_created_corrected: undefined,
    };
  },
  async created() {
    this.stack = await this.$api.getFolder({
      path: this.stack_path,
    });
    this.$api.join({ room: this.stack_path });

    this.$eventHub.$on("folder.removed", this.closeOnRemove);

    this.date_created_corrected = this.datetimeLocal(
      this.stack.date_created_corrected ||
        this.stack.$date_created ||
        this.stack.$date_uploaded
    );
  },
  mounted() {
    // const file_dates = this.stack_files_in_order.map(
    //   (f) => f.date_created_corrected || f.$date_created || f.$date_uploaded
    // );
    // file_dates.sort((a, b) => +new Date(b) - +new Date(a));
    // this.date_created_corrected = this.datetimeLocal(file_dates[0]);
  },
  beforeDestroy() {
    this.$api.leave({ room: this.stack_path });
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
  },
  watch: {},
  computed: {
    stack_files() {
      if (this.stack?.$files && this.stack.$files.length > 0)
        return this.stack.$files;
      return [];
    },
    stack_files_in_order() {
      if (this.stack_files.length === 0 || !this.stack?.stack_files_metas)
        return [];

      return this.stack.stack_files_metas.reduce((acc, meta_filename) => {
        const file = this.stack_files.find(
          (f) => this.getFilename(f.$path) === meta_filename
        );
        if (file) acc.push(file);
        return acc;
      }, []);
    },

    share_button_is_enabled() {
      return (
        this.stack.title?.length > 0 &&
        this.stack.keywords?.length > 0 &&
        this.stack_files_in_order.length > 0
      );
    },
    shared_folder_path() {
      if (this.$sharedFolderPath) return this.$sharedFolderPath();
      return false;
    },
  },
  methods: {
    async changeMediaOrder(old_position, new_position) {
      let meta_filenames = this.stack_files_in_order.map((f) =>
        this.getFilename(f.$path)
      );

      function array_move(arr, old_index, new_index) {
        if (new_index >= arr.length) {
          var k = new_index - arr.length + 1;
          while (k--) {
            arr.push(undefined);
          }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
      }
      array_move(meta_filenames, old_position, new_position);

      let new_meta = {
        stack_files_metas: meta_filenames,
      };

      if (
        !this.stack.$preview?.$path ||
        this.getFilename(this.stack.$preview?.$path) !== meta_filenames.at(0)
      )
        new_meta.$preview = meta_filenames.at(0);

      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta,
      });
    },

    async removeMediaFromStack(file_path) {
      await this.$api.copyFile({
        path: file_path,
        path_to_destination_folder: this.connected_as.$path,
        new_meta: {},
      });
      await this.$api.deleteItem({ path: file_path });

      let stack_files_metas = this.stack?.stack_files_metas.slice();
      stack_files_metas = stack_files_metas.filter((m) => m !== file_path);
      await this.$api.updateMeta({
        path: this.stack.$path,
        new_meta: {
          stack_files_metas,
        },
      });
    },

    async shareButtonClicked() {
      const path_to_destination_type = this.shared_folder_path + "/stacks";

      const copy_folder_path = await this.$api.copyFolder({
        path: this.stack.$path,
        path_to_destination_type,
        new_meta: {},
      });
      await this.$api.updateCover({
        path: copy_folder_path,
      });
      await this.$api.deleteItem({ path: this.stack.$path });
      this.$emit("close");
    },
    async removeStack() {
      await this.$api.deleteItem({ path: this.stack.$path });
      this.$emit("close");
    },
    closeOnRemove({ path }) {
      if (path === this.stack.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.stack_was_removed"));
        this.$emit("close");
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaFocus {
  // background: var(--chutier-bg);
  background: transparent;
  padding: calc(var(--spacing) / 2);
}
._itemsList {
  border: 2px solid #999;
  padding: calc(var(--spacing) / 2);
}

._openLarge {
  display: block;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
}

._docPreview {
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

._changeOrderSelect {
  flex: 0 0 50px;
}

._fields {
  padding: calc(var(--spacing) * 1);
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}

sl-icon-button::part(base) {
  color: white;
}
._removeFile {
}
._shareBtn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) / 2);
}
._descriptionField {
  resize: vertical;
}
</style>
