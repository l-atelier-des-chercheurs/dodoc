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
      <template v-else>
        <div class="_showSidebar">
          <button
            type="button"
            class="u-button u-button_icon u-button_transparent"
            @click.stop="show_sidebar = true"
          >
            <b-icon icon="list-ul" :aria-label="$t('show')" />
          </button>
        </div>

        <transition name="slideleft" mode="out-in">
          <div class="_infos" v-if="show_sidebar">
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
                  {{ date_created_corrected }}
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

              <div class="u-spacingBottom">
                <AuthorField
                  :label="$t('authors')"
                  :field="'$authors'"
                  :instructions="$t('file_author_instructions')"
                  :authors_paths="stack.$authors"
                  :path="stack.$path"
                  :can_edit="can_edit"
                  :no_options="true"
                />
              </div>

              <div class="u-spacingBottom">
                <AuthorField
                  :label="$t('admins')"
                  :field="'$admins'"
                  :instructions="$t('media_editing_instructions')"
                  :authors_paths="stack.$admins"
                  :path="stack.$path"
                  :can_edit="can_edit"
                />
              </div>

              <hr />

              <div v-if="can_edit" class="u-sameRow">
                <DownloadFolder :path="stack.$path" />
                <RemoveMenu
                  :remove_text="$t('remove')"
                  :remove_expl="$t('remove_stack_instr')"
                  @remove="removeStack"
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

            <button
              type="button"
              class="u-button u-button_icon u-button_transparent _hideSidebar"
              @click.stop="show_sidebar = false"
            >
              <b-icon icon="arrow-left" :aria-label="$t('hide')" />
            </button>
          </div>
        </transition>

        <transition name="fade" mode="out-in">
          <div
            v-if="show_sidebar && !dual_display"
            class="_overlay"
            @click="show_sidebar = false"
          />
        </transition>

        <StackCarousel
          class="_topCarousel"
          :data-dualdisplay="dual_display"
          :files="stack_files_in_order"
          :can_edit="can_edit"
          @removeMediaFromStack="removeMediaFromStack"
          @changeMediaOrder="changeMediaOrder"
        />
      </template>
    </div>
    <div v-if="can_be_selected === 'single_stack'" class="_selectBar">
      <button class="u-button" type="button" @click="$emit('selectStack')">
        {{ $t("select_stack") }}
      </button>
    </div>
    <div v-if="can_be_selected === 'multiple'" class="_selectBar">
      <button class="u-button" type="button" @click="selectAllStackMedias">
        {{ $t("add_all_stack_medias") }}
      </button>
    </div>
  </div>
</template>
<script>
// import ChutierItem from "@/components/chutier/ChutierItem.vue";
import KeywordsField from "@/components/KeywordsField.vue";
import StackCarousel from "@/components/archive/StackCarousel.vue";

export default {
  props: {
    stack_path: String,
    context: String,
    is_favorite: Boolean,
    can_be_added_to_fav: Boolean,
    can_be_selected: String,
  },
  components: {
    // ChutierItem,
    KeywordsField,
    StackCarousel,
  },
  inject: {},
  data() {
    return {
      stack: undefined,
      fetch_stack_error: undefined,
      is_loading: true,
      show_sidebar: localStorage.getItem("show_sidebar") !== "false",
      pane_width: undefined,
      ro: undefined,
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
        select_stack: "Sélectionner ce document",
        add_all_stack_medias: "Ajouter tous les médias de ce document",
      },
      en: {
        fill_title: "Fill in the title field",
        fill_keywords: "Fill in the keywords field",
        files_missing: "Add medias to this document",
        stack_not_public: "This document is not public",
        error_loading_stack: "Error loading document",
        select_stack: "Select this document",
        add_all_stack_medias: "Add all medias of this document",
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
    }
  },
  mounted() {
    this.updatePaneWidth();
    this.ro = new ResizeObserver(this.updatePaneWidth);
    this.ro.observe(this.$el);
    window.addEventListener("keyup", this.handleKeyPress);
  },
  beforeDestroy() {
    this.ro.unobserve(this.$el);
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
      if (!this.stack) return false;
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
    dual_display() {
      if (this.show_sidebar && this.pane_width > 360 * 2) return true;
      return false;
    },
  },
  methods: {
    updatePaneWidth() {
      this.pane_width = this.$el.offsetWidth;
    },
    selectAllStackMedias() {
      this.$emit("selectMedias", this.stack_files_in_order);
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

  > ._infos {
    // flex: 1 1 320px;

    [data-context="archive"] & {
      max-width: 360px;
    }
  }
  > ._topCarousel {
    // flex: 1 1 220px;
  }
}

._infos {
  position: absolute;
  display: flex;
  flex-flow: column nowrap;
  overflow: auto;
  z-index: 10;
  height: 100%;
  width: 100%;
  max-width: 360px;
  background: var(--sd-bg);

  @include scrollbar(3px, 4px, 4px, transparent, var(--c-noir));

  border-right: 1px solid var(--sd-separator);

  > ._allFields {
    flex: 1 1 0;
    padding: calc(var(--spacing) * 2);
  }
  > ._bottomBtns {
    flex: 0 0 auto;
  }
}

._overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  // background-color: rgba(119, 117, 124, 0.95);
  z-index: 9;
  cursor: pointer;
  backdrop-filter: blur(5px);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0.8;
    background-color: var(--sd-bg);
  }
}

._topCarousel {
  position: relative;
  z-index: 1;
  top: 0;

  height: 100%;
  width: 100%;
  background: white;
  background: var(--sd-bg);
  padding-left: 32px;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &[data-dualdisplay] {
    padding-left: 360px;
  }
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

._showSidebar {
  position: absolute;
  border-right: 1px solid var(--sd-separator);
  z-index: 10;
  height: 100%;
  background: var(--sd-bg);

  > button {
    height: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 0;

    &:hover,
    &:focus {
      color: white;
      background: var(--sd-separator);
    }
  }
}

._hideSidebar {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  z-index: 8;
  background: var(--active-color);
  border-radius: 0;
  padding: calc(var(--spacing) / 4);
}

._addToColl {
  padding: calc(var(--spacing) / 4);
}

._selectBar {
  // position: absolute;
  // bottom: 0;
  // left: 0;
  // width: 100%;
  z-index: 100;
  background-color: var(--h-500);
  // border-top: 1px solid var(--h-50);

  padding: calc(var(--spacing) * 1);
  text-align: center;
}
</style>
