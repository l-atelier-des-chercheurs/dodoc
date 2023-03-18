<template>
  <div class="_myChutier">
    <h1>MyChutier</h1>
    <div class="_importBtn">
      <input
        type="file"
        multiple="multiple"
        :id="id + '-add_file'"
        name="file"
        accept=""
        class="inputfile-2"
        @change="updateInputFiles($event)"
      />
      <label :for="id + '-add_file'">
        <svg width="20" height="17" viewBox="0 0 20 17">
          <path
            d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"
          />
        </svg>
        {{ $t("import") }}
      </label>
      <UploadFiles
        v-if="selected_files.length > 0"
        :selected_files="selected_files"
        :path="connected_as.$path"
        @close="selected_files = []"
      />
    </div>

    <div v-if="chutier" class="_grid">
      <MediaContent
        v-for="file in chutier.$files"
        :file="file"
        :key="file.$path"
      />
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      chutier: undefined,
      selected_files: [],
      id: `image_select_${(
        Math.random().toString(36) + "00000000000000000"
      ).slice(2, 3 + 2)}`,
    };
  },
  created() {},
  mounted() {
    this.listChutier();
    this.$api.join({ room: this.connected_as.$path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.connected_as.$path });
  },
  watch: {},
  computed: {},
  methods: {
    async listChutier() {
      this.chutier = await this.$api
        .getFolder({
          path: this.connected_as.$path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
    },
    updateInputFiles($event) {
      this.selected_files = Array.from($event.target.files);
      $event.target.value = "";
    },
  },
};
</script>
<style lang="scss" scoped>
._myChutier {
  padding: 0 calc(var(--spacing) / 1);
}
._importBtn {
  padding: calc(var(--spacing) / 1) 0;
}

._grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 2px;
  padding: calc(var(--spacing) / 2) 0;

  > * {
    aspect-ratio: 1/1;
    overflow: hidden;

    ::v-deep ._mediaContent--image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
}
</style>
