<template>
  <div class="_stackDisplay" :data-context="context">
    <div class="_closeStack">
      <button
        class="u-button u-button_icon u-button_transparent"
        @click="$emit('close')"
      >
        <b-icon icon="x-lg" :label="$t('close')" />
      </button>
    </div>
    <div class="_panes">
      <LoaderSpinner v-if="is_loading" />
      <div v-else-if="fetch_stack_error">
        {{ fetch_stack_error }}
      </div>
      <TwoColumnLayout
        v-else
        :show-sidebar.sync="show_sidebar"
        :show-toggle-button="true"
        :content-padding="false"
        class="_stackDisplayLayout"
      >
        <template #sidebar>
          <div class="_infos">
            <div class="_allFields">
              <div class="_titleRow">
                <TitleField
                  :label="$t('title')"
                  :field_name="'title'"
                  :content="stack.title"
                  :path="stack.$path"
                  :required="true"
                  :tag="'h1'"
                  :can_edit="can_edit"
                />
                <button
                  type="button"
                  class="u-button u-button_icon _addToColl"
                  v-if="can_be_added_to_fav"
                  @click.stop="$emit('toggleFav')"
                >
                  <b-icon
                    v-if="!is_favorite"
                    icon="star"
                    :aria-label="$t('add')"
                  />
                  <b-icon v-else icon="star-fill" :aria-label="$t('remove')" />
                </button>
              </div>

              <hr />

              <div>
                <CollaborativeEditor2
                  :label="$t('description')"
                  :field_to_edit="'description'"
                  :content="stack.description"
                  :path="stack.$path"
                  :custom_formats="['bold', 'italic', 'link']"
                  :is_collaborative="false"
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
              <!-- 
              <DetailsPane
                v-if="context === 'full'"
                :header="$t('location')"
                :is_open_initially="true"
                :icon="'map'"
                class="u-spacingBottom"
              > -->
              <PositionPicker
                :field_name="'$location'"
                :label="$t('location')"
                :content="stack.$location"
                :path="stack.$path"
                :can_edit="can_edit"
              />
              <!-- </DetailsPane> -->

              <hr />

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
                    :label="$t('date_modified')"
                    :field_name="'date_modified'"
                    :date="stack.$date_modified"
                    :path="stack.$path"
                    :input_type="'datetime-local'"
                    :can_edit="false"
                  />
                </div>
              </div>

              <hr />

              <!-- <div class="u-spacingBottom">
                <AuthorField
                  :label="$t('authors')"
                  :field="'$authors'"
                  :instructions="$t('file_author_instructions')"
                  :authors_paths="stack.$authors"
                  :path="stack.$path"
                  :can_edit="can_edit"
                  :no_options="true"
                />
              </div> -->

              <div class="u-spacingBottom">
                <AuthorField
                  :label="$t('authors')"
                  :field="'$admins'"
                  :instructions="$t('media_editing_instructions')"
                  :authors_paths="stack.$admins"
                  :path="stack.$path"
                  :can_edit="can_edit"
                />
              </div>

              <div class="" v-if="is_instance_admin">
                <StatusTag
                  v-if="can_edit"
                  :status="stack.$status || 'public'"
                  :status_options="['public', 'private']"
                  :path="stack.$path"
                  :can_edit="can_edit"
                />
              </div>

              <hr />

              <div v-if="can_edit" class="u-sameRow">
                <DownloadFolder :path="stack.$path" />
                <button
                  type="button"
                  class="u-buttonLink"
                  @click.stop="show_duplicate_stack_modal = true"
                >
                  <b-icon icon="file-plus" />
                  {{ $t("duplicate_or_move") }}
                </button>
                <RemoveMenu
                  :remove_text="$t('remove')"
                  :remove_expl="$t('remove_stack_instr')"
                  @remove="removeStack"
                />
              </div>
            </div>
            <!-- // todo remove -->
            <div class="_bottomBtns" v-if="context === 'chutier'">
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
          </div>
        </template>
        <template #content>
          <StackCarousel
            class="_topCarousel"
            :files="stack_files_in_order"
            :can_edit="can_edit"
            :can_be_selected="can_be_selected"
            :selected_files="selected_stack_files"
            @toggleMediaSelection="handleToggleMediaSelection"
            @selectMedia="selectMedia"
            @removeMediaFromStack="removeMediaFromStack"
            @changeMediaOrder="changeMediaOrder"
          />
        </template>
      </TwoColumnLayout>
    </div>
    <div v-if="can_be_selected === 'single_stack'" class="_selectBar">
      <button class="u-button" type="button" @click="$emit('selectStack')">
        {{ $t("select_stack") }}
      </button>
    </div>
    <div v-if="can_be_selected === 'single'" class="_selectBar">
      <button class="u-button" type="button" @click="addSelectedMedia">
        {{ $t("select_media") }}
      </button>
    </div>
    <div v-if="can_be_selected === 'multiple'" class="_selectBar">
      <button
        type="button"
        class="u-buttonLink"
        :disabled="selected_stack_files.length === stack_files_in_order.length"
        @click="selectAllMedias"
      >
        {{ $t("select_all") }}
      </button>
      <button
        class="u-button"
        type="button"
        @click="addSelectedMedias"
        :disabled="selected_stack_files.length === 0"
      >
        {{
          $tc("add_selected_medias", selected_stack_files.length, {
            count: selected_stack_files.length,
          })
        }}
      </button>
    </div>
    <DuplicateStackModal
      v-if="show_duplicate_stack_modal"
      :stack="stack"
      @close="show_duplicate_stack_modal = false"
    />
  </div>
</template>
<script>
// import ChutierItem from "@/components/chutier/ChutierItem.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import StackCarousel from "@/components/archive/StackCarousel.vue";
import DuplicateStackModal from "@/components/archive/DuplicateStackModal.vue";
import TwoColumnLayout from "@/adc-core/ui/TwoColumnLayout.vue";

export default {
  props: {
    stack_path: String,
    context: String,
    is_favorite: Boolean,
    can_be_added_to_fav: Boolean,
    can_be_selected: [Boolean, String],
    read_only: Boolean,
  },
  components: {
    // ChutierItem,
    KeywordsField,
    StackCarousel,
    DuplicateStackModal,
    TwoColumnLayout,
  },
  inject: {},
  data() {
    return {
      stack: undefined,
      fetch_stack_error: undefined,
      is_loading: true,
      show_sidebar: localStorage.getItem("show_sidebar") !== "false",
      selected_stack_files: [],
      show_duplicate_stack_modal: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        fill_title: "Veuillez remplir le champ Titre",
        fill_keywords: "Veuillez remplir le champ Mots-clés",
        files_missing: "Veuillez ajouter des médias à ce document",
        stack_not_public: "Ce document n'est pas public",
        error_loading_stack: "Erreur lors du chargement du document",
        select_stack: "Ajouter à ce document",
        add_selected_medias:
          "Ajouter le média sélectionné | Ajouter les {count} médias sélectionnés",
      },
      en: {
        fill_title: "Fill in the title field",
        fill_keywords: "Fill in the keywords field",
        files_missing: "Add medias to this document",
        stack_not_public: "This document is not public",
        error_loading_stack: "Error loading document",
        select_stack: "Add to this document",
        add_selected_medias:
          "Add selected media | Add the selected {count} medias",
      },
    },
  },
  async created() {
    this.stack = await this.$api
      .getFolder({
        path: this.stack_path,
      })
      .catch((err) => {
        this.is_loading = false;
        if (err.code === "folder_private") {
          this.fetch_stack_error = this.$t("stack_not_public");
        } else {
          this.fetch_stack_error = this.$t("error_loading_stack");
        }
        return;
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

      // this.selected_stack_files.push(this.stack_files_in_order[0]);
    }
  },
  mounted() {
    window.addEventListener("keyup", this.handleKeyPress);
  },
  beforeDestroy() {
    window.removeEventListener("keyup", this.handleKeyPress);
    if (this.stack) this.$api.leave({ room: this.stack.$path });
  },
  watch: {
    "stack.date_created_corrected"() {
      this.date_created_corrected = this.datetimeLocal(
        this.stack.date_created_corrected
      );
    },
    show_sidebar() {
      localStorage.setItem("show_sidebar", this.show_sidebar);
    },
  },
  computed: {
    can_edit() {
      if (!this.stack || this.read_only) return false;
      return this.canLoggedinEditFolder({ folder: this.stack });
    },
    stack_files_in_order() {
      return this.getStackFilesInOrder({
        stack: this.stack,
      });
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
    addSelectedMedia() {
      this.$emit("selectMedias", this.selected_stack_files);
    },
    addSelectedMedias() {
      this.$emit("selectMedias", this.selected_stack_files);
    },
    selectMedia($event) {
      this.selected_stack_files = [$event];
    },
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
      stack_files_metas = stack_files_metas.filter(
        (m) => m !== this.getFilename(file_path)
      );
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
          .log(this.$t("stack_was_removed"));
        this.$emit("close");
      }
    },
    handleKeyPress($event) {
      if ($event.key === "Escape") {
        this.$emit("close");
        return false;
      } else if ($event.key === "ArrowLeft") {
        this.$eventHub.$emit("carousel.prev");
      } else if ($event.key === "ArrowRight") {
        this.$eventHub.$emit("carousel.next");
      } else if ($event.key === "ArrowUp") {
        this.$eventHub.$emit("fileshown.showInfos");
      } else if ($event.key === "ArrowDown") {
        this.$eventHub.$emit("fileshown.hideInfos");
      }
    },
    handleToggleMediaSelection(file, checked) {
      if (checked) {
        if (!this.selected_stack_files.some((f) => f.$path === file.$path)) {
          this.selected_stack_files = [...this.selected_stack_files, file];
        }
      } else {
        this.selected_stack_files = this.selected_stack_files.filter(
          (f) => f.$path !== file.$path
        );
      }
      this.$emit("updateSelectedStackMedias", this.selected_stack_files);
    },
    selectAllMedias() {
      this.selected_stack_files = JSON.parse(
        JSON.stringify(this.stack_files_in_order)
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._stackDisplay {
  position: absolute;
  inset: 0;
  z-index: 100;

  background: var(--sd-bg);
  color: var(--sd-textcolor);

  display: flex;
  flex-flow: column nowrap;

  ._closeStack {
    flex: 0 0 auto;
  }
  ._panes {
    flex: 1 1 auto;
  }
}

._panes {
  position: relative;
  overflow: hidden;
  height: 100%;
}

._stackDisplayLayout {
  height: 100%;
}

._infos {
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  background: var(--sd-bg);

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));

  > ._allFields {
    flex: 1 1 0;
  }
  > ._bottomBtns {
    flex: 0 0 auto;
  }
}

._topCarousel {
  height: 100%;
  width: 100%;
  background: var(--sd-bg);
  padding-left: 32px;
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
  position: relative;
  border-bottom: 1px solid var(--sd-separator);
  z-index: 2;
  text-align: right;

  > button {
    width: 100%;
    padding: calc(var(--spacing) / 2);
    height: 2rem;
    justify-content: flex-end;
    border-radius: 0;

    &:hover,
    &:focus {
      color: white;
      background: var(--sd-separator);
    }
  }
}

._fileStack {
  border: 2px solid var(--sd-separator);
  padding: calc(var(--spacing) / 2);
  margin: calc(var(--spacing) * 2) 0;
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
    max-width: 360px;
  }
}

._titleRow {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: flex-start;
}

._addToColl {
  padding: calc(var(--spacing) / 4);
}

._selectBar {
  display: flex;
  justify-content: center;
  gap: calc(var(--spacing) / 2);

  z-index: 100;
  background-color: var(--h-500);
  // border-top: 1px solid var(--h-50);

  padding: calc(var(--spacing) * 1);
  text-align: center;
}
</style>
