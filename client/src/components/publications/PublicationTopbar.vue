<template>
  <div class="_topbar">
    <button
      v-if="no_back_button !== true"
      type="button"
      class="u-button u-button_icon _backPubli"
      @click="$emit('close')"
    >
      <b-icon
        icon="arrow-left-circle-fill"
        :aria-label="$t('back_to_publications')"
      />
    </button>

    <div class="_publiTitle">
      <TitleField
        :field_name="'title'"
        :tag="'h2'"
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
        v-if="can_edit && publication.template !== 'cartography'"
        @click="openSettings"
        caret
        class="u-button u-button_small"
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
        <RemoveMenu :remove_text="$t('remove')" @remove="removePublication" />
      </DropDown>

      <DropDown @show="closeSettings">
        <template slot="trigger">
          <b-icon icon="box-arrow-up-right" />
          {{ $t("share") }}
        </template>
        <div class="">
          <button
            type="button"
            class="u-buttonLink _exportBtn"
            :disabled="!can_edit || is_exporting"
            @click="exportPublication"
          >
            <sl-icon name="filetype-pdf" />
            {{ $t("export_in_pdf") }}
            <transition name="fade_fast" :duration="150" mode="out-in">
              <LoaderSpinner v-if="is_exporting" />
            </transition>
          </button>
        </div>
        <div class="">
          <button
            type="button"
            class="u-buttonLink"
            @click="show_qr_code_modal = true"
          >
            <sl-icon name="qr-code" />
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

export default {
  props: {
    publication: Object,
    no_back_button: Boolean,
    can_edit: Boolean,
  },
  components: {
    DuplicatePublication,
  },
  data() {
    return {
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

      const route = this.$router.resolve({
        path: this.createURLFromPath(this.publication.$path),
        query,
      });

      return window.location.origin + route.href;
    },
  },
  methods: {
    async exportPublication() {
      const additional_meta = {};
      additional_meta.$origin = "publish";
      if (this.connected_as?.$path)
        additional_meta.$authors = [this.connected_as.$path];

      let instructions = {
        recipe: "pdf",
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
        suggested_file_name: this.publication.title,
        additional_meta,
      };

      if (this.publication.page_spreads === true) instructions.page_width *= 2;

      const current_task_id = await this.$api.exportFolder({
        path: this.publication.$path,
        instructions,
      });
      this.$alertify.delay(4000).log(this.$t("compilation_started"));

      this.is_exporting = true;

      const checkIfEnded = ({ task_id }) => {
        if (task_id !== current_task_id) return;
        this.is_exporting = false;
        this.$eventHub.$off("task.ended", checkIfEnded);
      };
      this.$eventHub.$on("task.ended", checkIfEnded);
    },
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
  gap: calc(var(--spacing) / 2);
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
