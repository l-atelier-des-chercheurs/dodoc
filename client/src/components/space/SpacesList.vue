<template>
  <div class="_spacesList">
    <div v-if="is_loading" class="_loadingContainer">
      <LoaderSpinner />
    </div>

    <FoldersListWithFilter
      v-else
      ref="foldersList"
      :folders="spaces"
      :pinned_folders="settings.spaces_pinned"
      :path="path"
      :can_edit="is_instance_admin"
      :folder_type="'space'"
      :pin_field_name="'spaces_pinned'"
      :pin_label="$t('spaces_pinned')"
      :empty_message="$t('no_spaces')"
      :available_view_modes="['medium', 'map']"
      :default_view_mode="'medium'"
    >
      <template #before-sidebar-toggle>
        <button
          type="button"
          class="u-button u-button_small u-button_red"
          v-if="is_instance_admin || is_instance_contributor"
          @click="show_create_modal = true"
        >
          <b-icon icon="plus" :label="$t('create')" />
          {{ $t("create") }}
        </button>
      </template>

      <template #item="{ item, view_mode }">
        <SpacePresentation
          :space="item"
          :context="view_mode"
          :can_edit="false"
        />
      </template>
    </FoldersListWithFilter>

    <template v-if="is_instance_admin">
      <button type="button" class="u-buttonLink" @click="show_bin_modal = true">
        <b-icon icon="recycle" />
        {{ $t("bin") }}
      </button>
      <BinFolder
        v-if="show_bin_modal"
        :modal_title="$t('restore_spaces')"
        :path="'spaces'"
        @close="show_bin_modal = false"
      >
        <template v-slot="slotProps">
          <SpacePresentation
            :space="slotProps.project"
            :context="slotProps.context"
            :can_edit="slotProps.can_edit"
          />
        </template>
      </BinFolder>
    </template>
    <CreateFolder
      v-if="show_create_modal"
      :modal_name="$t('create_a_space')"
      :path="'spaces'"
      @close="show_create_modal = false"
      @openNew="openNewSpace"
    />
  </div>
</template>
<script>
import SpacePresentation from "@/components/space/SpacePresentation.vue";
import BinFolder from "@/adc-core/fields/BinFolder.vue";
import FoldersListWithFilter from "@/components/FoldersListWithFilter.vue";

export default {
  props: {},
  components: {
    SpacePresentation,
    BinFolder,
    FoldersListWithFilter,
  },
  data() {
    return {
      settings: undefined,
      spaces: undefined,
      path: "spaces",
      fetch_spaces_error: undefined,
      show_create_modal: false,
      is_loading: true,
      show_bin_modal: false,
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
    this.$api.join({ room: "." });

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
    this.$api.leave({ room: "." });
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {},
  methods: {
    openNewSpace(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._spacesList {
  width: 100%;
  min-height: 60vh;
}

._loadingContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: calc(var(--spacing) * 2);
}
</style>
