<template>
  <div class="_spacesList">
    <div class="_createBtn">
      <button
        type="button"
        class="u-button u-button_red u-button_small"
        v-if="is_instance_admin || is_instance_contributor"
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
        &nbsp;
        {{ $t("create") }}
      </button>
    </div>
    <CreateFolder
      v-if="show_create_modal"
      :modal_name="$t('create_a_space')"
      :path="'spaces'"
      @close="show_create_modal = false"
      @openNew="openNewSpace"
    />

    <PinnedNonpinnedFolder
      v-if="!is_loading"
      :field_name="'spaces_pinned'"
      :content="settings.spaces_pinned"
      :path="''"
      :folders="sorted_spaces"
      :can_edit="is_instance_admin"
      v-slot="slotProps"
    >
      <SpacePresentation
        :space="slotProps.item"
        :context="'list'"
        :can_edit="false"
      />
    </PinnedNonpinnedFolder>
  </div>
</template>
<script>
import PinnedNonpinnedFolder from "@/adc-core/ui/PinnedNonpinnedFolder.vue";
import SpacePresentation from "@/components/space/SpacePresentation.vue";

export default {
  props: {},
  components: {
    PinnedNonpinnedFolder,
    SpacePresentation,
  },
  data() {
    return {
      settings: undefined,
      spaces: undefined,
      path: "spaces",
      fetch_spaces_error: undefined,
      show_create_modal: false,
      is_loading: true,
    };
  },
  created() {},
  async mounted() {
    this.settings = await this.$api
      .getFolder({
        path: "",
      })
      .catch((err) => {
        return err;
      });
    this.$api.join({ room: "" });

    this.spaces = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_spaces_error = err.response;
        return;
      });
    this.$api.join({ room: this.path });

    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_spaces() {
      if (!this.spaces) return [];
      return this.spaces
        .slice()
        .filter((s) =>
          this.canLoggedinSeeFolder({
            folder: s,
          })
        )
        .sort(
          (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
        );
    },
  },
  methods: {
    getSlug(path) {
      return path.split("/").at(-1);
    },
    openNewSpace(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._create {
  max-width: 400px;
}
._spacesList {
  width: 100%;
  min-height: 60vh;
  margin: 0 auto;
  max-width: var(--max-column-width);
  // padding: calc(var(--spacing) * 1);
}

._createBtn {
  margin: calc(var(--spacing) / 2) 0;
  // margin-bottom: calc(var(--spacing) / 4);
}

._pinDropzone {
  border: 2px dotted var(--c-noir);
  border-radius: 10px;
  box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
  padding: calc(var(--spacing) / 2);
}
</style>
