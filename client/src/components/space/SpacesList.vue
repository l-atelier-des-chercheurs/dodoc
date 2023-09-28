<template>
  <div class="_spacesList">
    <div class="">
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

    <div class="_pinned" v-if="pinned_spaces.length > 0 || is_instance_admin">
      <div class="">
        <DLabel :str="$t('pinned')" />
        <template v-if="pinned_spaces.length === 0 && is_instance_admin">
          {{ $t("click_on_pin_on_space") }}
        </template>
      </div>
      <div class="_list">
        <SpacePresentation
          v-for="(space, index) in pinned_spaces"
          :key="space.$path"
          :space="space"
          :context="'list'"
          :can_edit="false"
          :position_in_list="positionInPinned(space.$path)"
          @movePin="movePin(index, $event)"
          @removeFromPins="removeFromPins(space.$path)"
        />
      </div>
      <hr />
    </div>
    <div class="_list">
      <SpacePresentation
        v-for="space in non_pinned_spaces"
        :key="space.$path"
        :space="space"
        :context="'list'"
        :can_edit="false"
        @addToPins="addSpaceToPins(space.$path)"
      />
    </div>
  </div>
</template>
<script>
import SpacePresentation from "@/components/space/SpacePresentation.vue";

export default {
  props: {},
  components: {
    SpacePresentation,
  },
  data() {
    return {
      settings: undefined,
      spaces: undefined,
      path: "spaces",
      fetch_spaces_error: undefined,
      show_create_modal: false,
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
    list_of_pins_paths() {
      if (
        !this.settings?.spaces_pinned ||
        !Array.isArray(this.settings.spaces_pinned) ||
        this.settings.spaces_pinned.length === 0
      )
        return [];
      return this.settings.spaces_pinned;
    },
    non_pinned_spaces() {
      return this.sorted_spaces.filter(
        (s) => !this.list_of_pins_paths.includes(s.$path)
      );
    },
    pinned_spaces() {
      return this.list_of_pins_paths.reduce((acc, pp) => {
        const s = this.sorted_spaces.find((sp) => sp.$path === pp);
        if (s) acc.push(s);
        return acc;
      }, []);
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
    async addSpaceToPins(path) {
      let spaces_pinned = this.list_of_pins_paths.slice();
      spaces_pinned.push(path);
      this.updateSettings({ spaces_pinned });
    },
    movePin(index, dir) {
      let spaces_pinned = this.list_of_pins_paths.slice();
      spaces_pinned.move(index, index + dir);
      this.updateSettings({ spaces_pinned });
    },
    positionInPinned(path) {
      if (this.pinned_spaces.length === 1) return "alone";
      const index = this.pinned_spaces.findIndex((ps) => ps.$path === path);
      if (index === 0) return "first";
      if (index === this.pinned_spaces.length - 1) return "last";
      return "none";
    },
    removeFromPins(path) {
      let spaces_pinned = this.list_of_pins_paths.slice();
      spaces_pinned = spaces_pinned.filter((sp) => sp !== path);
      this.updateSettings({ spaces_pinned });
    },
    async updateSettings(new_meta) {
      await this.$api.updateMeta({
        path: "",
        new_meta,
      });
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
  padding: calc(var(--spacing) * 1);
}

._list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: calc(var(--spacing) / 1);
  // margin: calc(var(--spacing) * 1) 0;

  > * {
    // margin: calc(var(--spacing) * 1) 0;
    // background: var(--panel-color);
    // margin-bottom: 2px;
    // border: var(--panel-borders);
    // box-shadow: var(--panel-shadows);
    // border-radius: var(--panel-radius);
  }
}

._pinned {
}

._pinDropzone {
  border: 2px dotted var(--c-noir);
  border-radius: 10px;
  box-shadow: 0 1px 10px rgb(0 0 0 / 20%);
  padding: calc(var(--spacing) / 2);
}
</style>
