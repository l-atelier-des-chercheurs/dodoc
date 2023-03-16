<template>
  <div class="_spacesList">
    <div class="u-sameRow">
      <h2>Les espaces</h2>
      <button
        type="button"
        class="u-button u-button_red u-button_small"
        v-if="connected_as"
        @click="show_create_modal = true"
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
            style="fill: #fc4b60"
            d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
          />
          <polygon
            style="fill: #ffffff"
            points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
          />
        </svg>
        {{ $t("create_a_space") }}
      </button>
    </div>

    <CreateSpace
      v-if="show_create_modal"
      @close="show_create_modal = false"
      @openNewSpace="openNewSpace"
    />

    <div class="_list">
      <SpacePreview v-for="space in spaces" :key="space.$path" :space="space" />
    </div>
  </div>
</template>
<script>
import SpacePreview from "@/components/space/SpacePreview.vue";
import CreateSpace from "@/components/modals/CreateSpace.vue";

export default {
  props: {},
  components: {
    SpacePreview,
    CreateSpace,
  },
  data() {
    return {
      spaces: undefined,
      new_space_title: "",
      path: "spaces",
      fetch_spaces_error: undefined,
      show_create_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.spaces = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_spaces_error = err.response;
        // this.is_loading = false;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    getSlug(path) {
      return path.split("/").at(-1);
    },
    async createSpace() {
      try {
        const new_space_slug = await this.$api.createFolder({
          path: this.path,
          additional_meta: {
            title: this.new_space_title,
            requested_slug: this.new_space_title,
            $authors: [this.$api.tokenpath.token_path],
          },
        });
        new_space_slug;
      } catch (err) {
        // this.error_msg = "Error: " + err.message;
        // setTimeout(() => {
        //   this.error_msg = "";
        // }, 5000);
        // this.is_creating_project = false;
      }
    },
    openNewSpace() {},
  },
};
</script>
<style lang="scss" scoped>
._create {
  max-width: 400px;
}
._spacesList {
  width: 100%;
}

._list {
  // display: grid;
  // grid-auto-rows: max-content;
  // grid-gap: calc(var(--spacing) / 1);
  // align-items: stretch;
  // grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  gap: calc(var(--spacing) / 1);
  margin: calc(var(--spacing) / 1);

  > * {
    background: var(--panel-color);
    border: var(--panel-borders);
    box-shadow: var(--panel-shadows);
    // border-radius: var(--panel-radius);
  }
}
</style>
