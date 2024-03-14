<template>
  <div class="_openedCollection">
    <transition name="slideup" mode="out-in">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else key="opened-collection">
        <div v-if="!collection.$path">
          {{ $t("failed_loading") }}
        </div>
        <div v-else :key="collection.$path">
          <div class="_topbar">
            <div class="">
              <button
                type="button"
                class="u-buttonLink"
                @click="$emit('close')"
              >
                <b-icon icon="arrow-left" />
                {{ $t("back") }}
              </button>
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

            <DropDown v-if="can_edit">
              <RemoveMenu
                v-if="can_edit"
                :remove_text="$t('remove')"
                @remove="removeCollection"
              />
              <button
                type="button"
                class="u-buttonLink"
                @click="show_qr_code_modal = true"
              >
                <sl-icon name="qr-code" />
                {{ $t("direct_link") }}
              </button>
            </DropDown>
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

            <!-- <DropDown v-if="can_edit"> -->
            <!-- </DropDown> -->
          </div>

          <div class="_cont">
            <StorySectionTemplate
              v-if="
                !collection.template ||
                collection.template === '`story_with_sections`'
              "
              :publication="collection"
              :opened_section_meta_filename="opened_section_meta_filename"
              :can_edit="can_edit"
              @toggleSection="toggleSection"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    opened_collection_slug: String,
  },
  components: {
    StorySectionTemplate: () =>
      import("@/components/publications/templates/StorySectionTemplate.vue"),
  },
  data() {
    return {
      is_loading: true,
      collection: undefined,
      path: "collections/" + this.opened_collection_slug,
      opened_section_meta_filename: "",
      show_qr_code_modal: false,
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
    this.collection = await this.$api
      .getFolder({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_stopmotion_error = err.response;
      });

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
      // if (this.publication.template === "page_by_page")
      //   query = { display: "slides" };
      // else if (this.publication.template === "story_with_sections")
      query = { display: "section" };

      const route = this.$router.resolve({
        path: this.createURLFromPath(this.collection.$path),
        query,
      });

      return window.location.origin + route.href;
    },
  },
  methods: {
    addToStack() {
      //
    },
    toggleSection(section_meta_filename) {
      this.opened_section_meta_filename = section_meta_filename;
    },
    async updateOpenedCollection() {
      //
    },
    async removeCollection() {
      await this.$api.deleteItem({
        path: this.collection.$path,
      });
      this.$emit("close");
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

._topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;

  padding: calc(var(--spacing) / 1);
  border-bottom: 1px solid var(--c-gris);
}

._cont {
  margin: calc(var(--spacing) / 2) 0;
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
</style>
