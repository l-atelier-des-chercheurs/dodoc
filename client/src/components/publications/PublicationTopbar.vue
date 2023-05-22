<template>
  <div class="_topbar">
    <TitleField
      :label="$t('title')"
      :field_name="'title'"
      :tag="'h2'"
      :content="publication.title"
      :path="publication.$path"
      :can_edit="can_edit"
    />
    <!-- <TitleField
          :label="$t('template')"
          :field_name="'template'"
          :content="publication.template"
          :path="publication.$path"
          :can_edit="false"
        /> -->
    <!-- <AuthorField
          :label="$t('contributors')"
          :authors_paths="publication.$authors"
          :path="publication.$path"
          :can_edit="can_edit"
        /> -->

    <div class="_buttonRow">
      <div class="" v-if="can_edit">
        <button
          type="button"
          class="u-buttonLink _exportBtn"
          :disabled="is_exporting"
          @click="exportPublication"
        >
          <sl-icon name="filetype-pdf" />
          {{ $t("export") }}
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
          {{ $t("share") }}
        </button>
        <QRModal
          v-if="show_qr_code_modal"
          :url_to_access="share_url"
          @close="show_qr_code_modal = false"
        />
        <!-- <router-link :to="share_path" target="_blank" class="u-buttonLink">
              <sl-icon name="share" />
              {{ $t("share") }}
            </router-link> -->
      </div>
      <RemoveMenu
        v-if="can_edit"
        :remove_text="$t('remove')"
        @remove="removePublication"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {
    publication: Object,
    can_edit: Boolean,
  },
  components: {},
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
      let instructions = {
        recipe: "pdf",
        page_width: this.publication.page_width,
        page_height: this.publication.page_height,
        layout_mode: this.publication.layout_mode || "print",
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
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  display: flex;
  align-items: center;
  width: 100%;
  background: white;

  padding: calc(var(--spacing) / 2) calc(var(--spacing) * 1);
  border-radius: 10px;
  margin: calc(var(--spacing) / 2) auto calc(var(--spacing) / 1);
  box-shadow: 0 1px 4px rgb(0 0 0 / 10%);
  // max-width: 800px;
}

._buttonRow {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
}
._exportBtn {
  position: relative;
}
</style>
