<template>
  <BaseModal2 :title="title || $t('export')" @close="$emit('close')">
    <div class="_cont">
      <div class="u-spacingBottom">
        <slot />
      </div>

      <div class="">
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
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 168 168"
              style="enable-background: new 0 0 168 168"
              xml:space="preserve"
            >
              <path
                style="fill: var(--c-rouge)"
                d="M84,0C37.6,0,0,37.6,0,84c0,46.4,37.6,84,84,84c46.4,0,84-37.6,84-84 C168,37.6,130.4,0,84,0z"
              />
              <g style="fill: var(--c-orange)">
                <path d="m42 42h21.6v21h-21.6z" />
                <path d="m73.2 42h21.6v21h-21.6z" />
                <path d="m104.4 42h21.6v21h-21.6z" />
                <path d="m42 73.5h21.6v21h-21.6z" />
                <path d="m73.2 73.5h21.6v21h-21.6z" />
                <path d="m104.4 73.5h21.6v21h-21.6z" />
                <path d="m42 105h21.6v21h-21.6z" />
                <path d="m73.2 105h21.6v21h-21.6z" />
                <path d="m104.4 105h21.6v21h-21.6z" />
              </g>
            </svg>
            {{ $t("save_to_project") }}
          </button>
        </div>
      </div>
      <div class="_saveNotice" v-if="finished_saving_to_project">
        {{ $t("media_was_saved") }}
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
    project_path: String,
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
  computed: {
    export_href() {
      if (this.export_blob) return window.URL.createObjectURL(this.export_blob);
      return false;
    },
  },
  methods: {
    async saveToProject() {
      const additional_meta = {};
      additional_meta.$origin = "make";
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

      this.finished_saving_to_project = true;
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
