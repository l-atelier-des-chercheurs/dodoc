<template>
  <div class="_openedCollection">
    <transition name="slideup" mode="out-in">
      <div v-if="is_loading" key="loader">
        <div class="_spinner">
          <LoaderSpinner />
        </div>
      </div>
      <div v-else-if="fetch_coll_error_message" class="_error" key="err">
        <a href="/publish">
          <b-icon icon="arrow-left" />
          {{ $t("back") }}
        </a>
        <div class="">
          {{ fetch_coll_error_message }}
        </div>
      </div>
      <div class="_coll" v-else :key="collection.$path">
        <div class="_topbar">
          <div class="u-sameRow">
            <router-link
              to="/publish"
              class="u-button u-button_icon u-button_white"
              :title="$t('back')"
            >
              <b-icon icon="arrow-left" />
            </router-link>
            <TitleField
              :field_name="'title'"
              :content="collection.title"
              :path="collection.$path"
              :tag="'h1'"
              :required="true"
              :can_edit="can_edit"
            />
          </div>

          <AuthorField
            class="_admins"
            :label="$t('admins')"
            :instructions="$t('media_editing_instructions')"
            :field="'$admins'"
            :authors_paths="collection.$admins"
            :path="collection.$path"
            :can_edit="can_edit"
            :show_image_only="true"
          />

          <div class="_btnRow">
            <div>
              <StatusTag
                v-if="can_edit"
                :status="collection.$status || 'public'"
                :status_options="['public', 'private']"
                :path="collection.$path"
                :can_edit="can_edit"
              />
            </div>
            <div>
              <button
                type="button"
                v-if="
                  can_edit && !['cartography'].includes(collection.template)
                "
                @click="toggleSettings"
                caret
                class="u-buttonLink"
              >
                <b-icon
                  icon="gear"
                  slot="prefix"
                  :aria-label="$t('settings')"
                />
                {{ $t("settings") }}
              </button>
            </div>

            <DropDown>
              <template #trigger>
                <button type="button" class="u-buttonLink">
                  {{ $t("options") }}
                </button>
              </template>
              <button
                type="button"
                class="u-buttonLink"
                @click="show_duplicate_publi_modal = true"
              >
                {{ $t("duplicate") }}
              </button>
              <DuplicatePubliModal
                v-if="show_duplicate_publi_modal"
                :modal_title="$t('duplicate', { name: collection.title })"
                :publication="collection"
                @close="show_duplicate_publi_modal = false"
              />

              <RemoveMenu
                v-if="can_edit"
                :remove_text="$t('remove')"
                @remove="removeCollection"
              />
            </DropDown>

            <!-- <DropDown v-if="can_edit"> -->
            <div v-if="can_edit">
              <button
                type="button"
                class="u-buttonLink _exportBtn"
                @click="show_export_pdf_modal = true"
              >
                <b-icon icon="save2-fill" />
                {{ $t("export") }}
              </button>
            </div>
            <ExportPubliModal
              v-if="show_export_pdf_modal"
              :modal_title="$t('export_publi', { name: collection.title })"
              :publication="collection"
              :pane_infos="pane_infos"
              @close="show_export_pdf_modal = false"
            />

            <div>
              <button
                type="button"
                class="u-buttonLink"
                @click="show_qr_code_modal = true"
              >
                <div part="base" class="icon" aria-hidden="true">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-qr-code"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2 2h2v2H2V2Z"></path>
                    <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"></path>
                    <path
                      d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"
                    ></path>
                    <path
                      d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
                    ></path>
                    <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
                  </svg>
                </div>
                {{ $t("direct_link") }}
              </button>
              <!-- </DropDown> -->
              <QRModal
                v-if="show_qr_code_modal"
                :url_to_access="share_url"
                @close="show_qr_code_modal = false"
              >
                <ToggleField
                  :label="$t('make_public')"
                  :field_name="'$public'"
                  :content="collection.$public === true"
                  :path="collection.$path"
                  :can_edit="can_edit"
                />
              </QRModal>
            </div>
          </div>
          <!-- <DropDown v-if="can_edit"> -->
          <!-- </DropDown> -->
        </div>

        <div class="_cont" :data-template="collection.template">
          <StorySectionTemplate
            v-if="
              !collection.template ||
              collection.template === 'story_with_sections'
            "
            :publication="collection"
            :pane_infos="pane_infos"
            :can_edit="can_edit"
            @updatePane="$emit('updatePane', $event)"
          />
          <AgoraTemplate
            v-else-if="collection.template === 'agora'"
            :publication="collection"
            :can_edit="can_edit"
          />
          <EditionTemplate
            v-else-if="collection.template === 'edition'"
            :publication="collection"
            :pane_infos="pane_infos"
            :can_edit="can_edit"
            @updatePane="$emit('updatePane', $event)"
          />
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
import DuplicatePubliModal from "@/components/collections/DuplicatePubliModal.vue";

export default {
  props: {
    opened_collection_slug: String,
    pane_infos: Object,
  },
  components: {
    StorySectionTemplate: () =>
      import("@/components/publications/templates/StorySectionTemplate.vue"),
    AgoraTemplate: () =>
      import("@/components/publications/templates/AgoraTemplate.vue"),
    EditionTemplate: () =>
      import("@/components/publications/templates/EditionTemplate.vue"),
    ExportPubliModal: () =>
      import("@/components/publications/ExportPubliModal.vue"),
    DuplicatePubliModal,
  },
  data() {
    return {
      is_loading: true,
      collection: undefined,
      path: "publications/" + this.opened_collection_slug,
      fetch_coll_error_message: "",
      show_qr_code_modal: false,
      show_export_pdf_modal: false,
      show_duplicate_publi_modal: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        make_public: "Accès public (sans mot de passe ou compte)",
      },
      en: {
        make_public: "Allow access to everyone (without password or account)",
      },
    },
  },
  async created() {
    const collection = await this.$api
      .getFolder({
        path: this.path,
      })
      .catch((err) => {
        if (err.code === "folder_private")
          this.fetch_coll_error_message = this.$t("coll_is_private");
        else this.fetch_coll_error_message = err.code;
        this.is_loading = false;
        return;
      });

    this.collection = collection;

    this.is_loading = false;
    this.$api.join({ room: this.path });

    this.$eventHub.$on("collection.addStack", this.addToStack);
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.path });
    this.$eventHub.$off("collection.addStack", this.addToStack);
  },
  watch: {},
  computed: {
    can_edit() {
      return this.canLoggedinEditFolder({ folder: this.collection });
    },
    share_url() {
      let query = {};
      if (this.collection.template === "story_with_sections")
        query = { display: "section" };
      if (
        this.collection.template === "agora" &&
        this.collection.autoscroll === true
      )
        query = { scroll: "auto" };

      const collection_slug = this.collection.$path.split("/").at(-1);
      const path = `/publications/${collection_slug}`;

      const route = this.$router.resolve({
        path,
        query,
      });

      return window.location.origin + route.href;
    },
  },
  methods: {
    addToStack() {
      //
    },
    async removeCollection() {
      await this.$api.deleteItem({
        path: this.collection.$path,
      });
      this.$emit("close");
    },
    toggleSettings() {
      this.$eventHub.$emit("publication.settings.toggle");
    },
  },
};
</script>
<style lang="scss" scoped>
._openedCollection {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--body-bg);
  height: 100%;
  width: 100%;
  overflow: auto;
}
._spinner {
  padding: calc(var(--spacing) * 2);
}

._titleBar {
  padding: calc(var(--spacing) / 1);
  padding-bottom: 0;
}

._coll {
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;

  > * {
    &._topbar {
    }
    &._cont[data-template="edition"] {
      flex: 1 1 auto;
    }
  }
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  padding: calc(var(--spacing) / 2);
  border-bottom: 1px solid var(--border-color);
}

._cont {
  // margin: calc(var(--spacing) / 2) 0;

  &[data-template="edition"] {
  }
}

._items {
}

._items--item {
  width: 100%;
  min-height: 2rem;
  margin-bottom: calc(var(--spacing) / 2);
}

._admins {
  ::v-deep ._dLabel {
    display: none;
  }
}
._error {
  padding: calc(var(--spacing) * 1);
}

._btnRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
</style>
