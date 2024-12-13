<template>
  <BaseModal2 :title="title || $t('export')" @close="$emit('close')">
    <div class="_cont">
      <div class="u-spacingBottom">
        <slot />
      </div>

      <div v-if="enable_options">
        <div class="u-sameRow">
          <a
            :disabled="!export_href"
            :download="export_name"
            :href="export_href"
            target="_blank"
            class="u-buttonLink"
          >
            {{ $t("download") }}
          </a>
          <button
            type="button"
            class="u-button u-button_red"
            @click="saveToProject"
          >
            <span class="u-icon" v-html="dodoc_icon_collect" />
            {{ $t("save_to_project") }}
          </button>
        </div>
      </div>
      <div class="_saveNotice" v-if="finished_saving_to_project">
        {{ $t("media_was_saved_to_project") }}
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    title: String,
    export_name: {
      type: String,
      default: "file",
    },
    export_blob: [Boolean, Blob],
    export_href: String,
    project_path: String,
    enable_options: {
      type: Boolean,
      default: true,
    },
  },
  components: {},
  data() {
    return {
      finished_saving_to_project: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async saveToProject() {
      if (this.export_blob) {
        const additional_meta = {};

        additional_meta.$origin = "make";
        if (this.connected_as?.$path)
          additional_meta.$authors = [this.connected_as.$path];

        await this.$api
          .uploadFile({
            path: this.project_path,
            filename: this.export_name,
            file: this.export_blob,
            additional_meta,
          })
          .catch((err) => {
            this.$alertify.delay(4000).error(err);
            throw err;
          });
      }

      this.finished_saving_to_project = true;
      this.$eventHub.$emit("animatePane", "collect");
      setTimeout(() => {
        this.$emit("close");
      }, 3000);
    },
  },
};
</script>
<style lang="scss" scoped>
._cont {
  position: relative;
}
._saveNotice {
  position: absolute;
  inset: -2px;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
