<template>
  <div class="_stackDisplay">
    <LoaderSpinner v-if="is_loading" />
    <template v-else>
      <div class="_closeStack">
        <button class="u-button u-button_icon" @click="$emit('close')">
          <b-icon icon="x-lg" :label="$t('close')" />
        </button>
      </div>

      <StackCarousel
        v-if="context === 'archive'"
        class="_topCarousel"
        :files="stack_files_in_order"
      />

      <div class="_allFields">
        <div class="_dateFields">
          <div class="">
            <DateField
              :label="$t('created')"
              :field_name="'date_created_corrected'"
              :date="date_created_corrected"
              :path="stack.$path"
              :input_type="'datetime-local'"
              :can_edit="can_edit"
            />
          </div>
          <div class="">
            <DateField
              :label="$t('date_sent')"
              :field_name="'date_modified'"
              :date="stack.$date_modified"
              :path="stack.$path"
              :input_type="'datetime-local'"
              :can_edit="false"
            />
          </div>
        </div>

        <hr />

        <div class="">
          <TitleField
            :label="!stack.title ? $t('title') : ''"
            :field_name="'title'"
            :content="stack.title"
            :path="stack.$path"
            :required="true"
            :tag="'h1'"
            :can_edit="can_edit"
          />
        </div>

        <hr />

        <div class="">
          <KeywordsField
            :label="$t('keywords')"
            :field_name="'keywords'"
            :keywords="stack.keywords"
            :path="stack.$path"
            :can_edit="can_edit"
          />
        </div>

        <hr />

        <div>
          <TitleField
            :label="$t('description')"
            :field_name="'description'"
            :content="stack.description"
            :path="stack.$path"
            :input_type="'markdown'"
            :can_edit="can_edit"
          />
        </div>

        <transition-group tag="div" class="_fileStack" name="listComplete">
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

        <AuthorField
          v-if="context === 'chutier'"
          :label="$t('admins')"
          class="u-spacingBottom"
          :field="'$admins'"
          :authors_paths="stack.$admins"
          :path="stack.$path"
          :can_edit="can_edit"
        />
        <AuthorField
          v-else-if="context === 'archive'"
          :label="$t('contributors')"
          class="u-spacingBottom"
          :field="'$authors'"
          :authors_paths="stack.$authors"
          :path="stack.$path"
          :can_edit="can_edit"
        />

        <div v-if="can_edit" class="u-sameRow">
          <DownloadFolder :path="stack.$path" />
          <RemoveMenu :remove_text="$t('remove_stack')" @remove="removeStack" />
        </div>
      </div>

      <div class="_bottomBtns" v-if="context === 'chutier'">
        <transition name="pagechange" mode="out-in">
          <button
            type="button"
            :key="share_button_is_enabled"
            class="u-button u-button_red _btn"
            :disabled="!share_button_is_enabled"
            @click="publishStack"
          >
            {{ $t("publish") }}&nbsp;
            <sl-icon name="arrow-right-square" style="font-size: 1rem" circle />
          </button>
        </transition>
        <div class="u-instructions">
          <div v-if="!stack.title || stack.title.length === 0">
            {{ $t("fill_title") }}
          </div>
          <div v-if="!stack.keywords || stack.keywords.length === 0">
            {{ $t("fill_keywords") }}
          </div>
          <div v-if="stack_files_in_order.length === 0">
            {{ $t("files_missing") }}
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
<script>
import ChutierItem from "@/components/chutier/ChutierItem.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import StackCarousel from "@/components/archive/StackCarousel.vue";

export default {
  props: {
    stack_path: String,
    context: String,
  },
  components: {
    ChutierItem,
    KeywordsField,
    StackCarousel,
  },
  inject: {
    $sharedFolderPath: {
      default: false,
    },
  },
  data() {
    return {
      is_loading: true,
    };
  },
  i18n: {
    messages: {
      fr: {
        fill_title: "Veuillez remplir le champ Titre",
        fill_keywords: "Veuillez remplir le champ Mots-clés",
        files_missing: "Veuillez ajouter des médias à ce document",
      },
    },
  },
  async created() {
    this.stack = await this.$api.getFolder({
      path: this.stack_path,
    });
    this.$api.join({ room: this.stack.$path });
    this.is_loading = false;

    this.date_created_corrected = this.datetimeLocal(
      this.stack.date_created_corrected ||
        this.stack.$date_created ||
        this.stack.$date_uploaded
    );

    // check if $preview is set to first image
    if (this.stack_files_in_order.length > 0) {
      const first_file_path = this.stack_files_in_order[0].$path;
      if (this.stack.$preview?.$path !== first_file_path) {
        await this.$api.updateMeta({
          path: this.stack.$path,
          new_meta: {
            $preview: this.getFilename(first_file_path),
          },
        });
      }
    }
  },
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
    this.$api.leave({ room: this.stack.$path });
  },
  watch: {},
  computed: {
    can_edit() {
      if (!this.stack) return false;
      return this.canLoggedinEditFolder({ folder: this.stack });
    },
    stack_files_in_order() {
      return this.getStackFilesInOrder({
        stack: this.stack,
      });
    },
    shared_folder_path() {
      if (this.$sharedFolderPath) return this.$sharedFolderPath();
      return false;
    },
    share_button_is_enabled() {
      return (
        this.stack.title?.length > 0 &&
        this.stack.keywords?.length > 0 &&
        this.stack_files_in_order.length > 0
      );
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
    async publishStack() {
      const path_to_destination_type = this.shared_folder_path + "/stacks";

      await this.$api.copyFolder({
        path: this.stack.$path,
        path_to_destination_type,
        new_meta: {
          $admins: "everyone",
          $authors: this.stack.$admins,
        },
      });
      await this.$api.deleteItem({ path: this.stack.$path });
      this.$emit("close");
    },
    handleKeyPress($event) {
      if ($event.key === "Escape") {
        this.$emit("close");
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._stackDisplay {
  position: absolute;
  inset: 0;
  z-index: 100;
  overflow: auto;

  background: var(--sd-bg);
  color: var(--sd-textcolor);

  display: flex;
  flex-flow: column nowrap;

  --carousel-height: 70vh;

  > ._allFields {
    flex: 1 1 0;
    padding: calc(var(--spacing) * 2);
    background: var(--sd-bg);
  }
  > ._bottomBtns {
    flex: 0 0 auto;
  }
}

._topCarousel {
  position: sticky;
  top: 0;

  flex: 0 0 var(--carousel-height);
  height: var(--carousel-height);
  width: 100%;
  background: white;
}

._allFields {
  position: relative;
  // padding-bottom: calc(var(--spacing) * 2);
}

hr {
  border-color: var(--sd-separator);
}
._dateFields {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) * 1);

  > * {
    flex: 1 1 50px;
  }
}

._closeStack {
  position: sticky;
  height: 0;
  top: 0;
  left: 0;
  // width: 100%;
  z-index: 2;

  > button {
    padding: calc(var(--spacing) / 2);
  }
}

._fileStack {
  border: 2px solid var(--sd-separator);
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) * 2) 0;
}

._changeOrderSelect {
  flex: 0 0 50px;
}

._bottomBtns {
  position: sticky;
  bottom: 0;

  text-align: center;
  background: var(--c-noir);
  padding: calc(var(--spacing) * 2);

  ._btn {
    width: 100%;
    border-radius: 4px;
    max-width: 320px;
  }
}
</style>
