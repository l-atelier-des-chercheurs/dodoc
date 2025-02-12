<template>
  <div class="_topbar">
    <button
      v-if="no_back_button !== true"
      type="button"
      class="u-button u-button_icon _backPubli"
      @click="$emit('close')"
    >
      <b-icon
        icon="arrow-left-circle"
        :aria-label="$t('back_to_publications')"
      />
    </button>

    <div class="_publiTitle">
      <TitleField
        :label="$t('title')"
        :show_label="false"
        :field_name="'title'"
        :tag="'h3'"
        :maxlength="40"
        :required="true"
        :content="publication.title"
        :path="publication.$path"
        :can_edit="can_edit"
      />
    </div>

    <div class="_buttonRow">
      <div
        class=""
        v-if="can_edit && publication.$admins !== 'parent_contributors'"
      >
        <small>
          <button
            class="u-buttonLink"
            type="button"
            @click="setCorrectPermForAdmins"
          >
            set perm to parent
            <!-- // legacy button -->
          </button>
          {{ publication.$admins }}
        </small>
      </div>

      <StatusTag
        v-if="can_edit"
        :status="publication.$status || 'public'"
        :status_options="['public', 'private']"
        :path="publication.$path"
        :can_edit="can_edit"
      />

      <button
        type="button"
        v-if="
          can_edit && !['cartography', 'edition'].includes(publication.template)
        "
        @click="openSettings"
        caret
        class="u-button u-button_small u-button_transparent"
      >
        <b-icon icon="gear" slot="prefix" :aria-label="$t('settings')" />
        {{ $t("settings") }}
      </button>

      <DropDown v-if="can_edit" @show="closeSettings">
        <DuplicatePublication
          :path="publication.$path"
          :source_title="publication.title"
          :publication="publication"
          @close="$emit('close')"
        />
        <RemoveMenu
          :modal_title="$t('remove_publication', { name: publication.title })"
          @remove="removePublication"
        />
      </DropDown>

      <DropDown :right="true" @show="closeSettings">
        <template slot="trigger">
          <b-icon icon="box-arrow-up-right" />
          {{ $t("share") }}
        </template>
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
          :modal_title="$t('export_publi', { name: publication.title })"
          :publication="publication"
          :page_opened_id="page_opened_id"
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
                <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"></path>
                <path
                  d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
                ></path>
                <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
              </svg>
            </div>
            {{ $t("direct_link") }}
          </button>
        </div>
        <QRModal
          v-if="show_qr_code_modal"
          :url_to_access="share_url"
          @close="show_qr_code_modal = false"
        >
          <!-- <div v-if="$root.app_infos.instance_meta.has_general_password">
            instance has general password, make publication public to display
          </div> -->
          <ToggleField
            :label="$t('make_publication_public')"
            :field_name="'$public'"
            :content="publication.$public === true"
            :path="publication.$path"
            :can_edit="can_edit"
          />
        </QRModal>
      </DropDown>
    </div>
  </div>
</template>
<script>
import DuplicatePublication from "@/components/publications/DuplicatePublication.vue";
import ExportPubliModal from "@/components/publications/ExportPubliModal.vue";

export default {
  props: {
    publication: Object,
    page_opened_id: String,
    no_back_button: Boolean,
    can_edit: Boolean,
  },
  components: {
    DuplicatePublication,
    ExportPubliModal,
  },
  data() {
    return {
      show_export_pdf_modal: false,
      show_qr_code_modal: false,
      is_exporting: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    share_url() {
      let query = {};
      if (this.publication.template === "page_by_page")
        query = { display: "slides" };
      else if (this.publication.template === "story_with_sections")
        query = { display: "section" };
      else if (this.publication.template === "cartography")
        query = { display: "section" };

      const route = this.$router.resolve({
        path: this.createURLFromPath(this.publication.$path),
        query,
      });

      return window.location.origin + route.href;
    },
  },
  methods: {
    async removePublication() {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const response = await this.$api.deleteItem({
          path: this.publication.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
        // this.$alertify.delay(4000).error(err);
      }
    },
    async setCorrectPermForAdmins() {
      await this.$api.updateMeta({
        path: this.publication.$path,
        new_meta: {
          $admins: "parent_contributors",
        },
      });
    },
    openSettings() {
      this.$eventHub.$emit("publication.settings.toggle");
    },
    closeSettings() {
      this.$eventHub.$emit("publication.settings.close");
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  align-items: center;
  width: 100%;
  background: white;

  padding: calc(var(--spacing) / 2);
  margin: 0;
  // border-top: 1px solid var(--c-gris);
  border-bottom: 1px solid var(--c-gris);
}

._publiTitle {
  flex: 10 1 auto;
}

._buttonRow {
  display: flex;
  flex-flow: row wrap;

  flex: 1 1 auto;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}
._exportBtn {
  position: relative;
}

._backPubli {
  font-size: 1.1rem;
}
</style>
