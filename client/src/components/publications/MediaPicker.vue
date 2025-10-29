<template>
  <BaseModal2
    :title="select_mode === 'single' ? $t('pick_media') : $t('pick_medias')"
    class="_mediaPicker"
    size="large"
    @close="$emit('close')"
  >
    <div class="_sourceSelector">
      <div>
        <button
          type="button"
          class="u-button u-button_orange _sourceBtn"
          @click="selected_source = 'project'"
        >
          <span class="u-icon" v-html="dodoc_icon_collect" />
          <div class="_sourceBtnContent">
            <div>
              <strong>{{ $t("import_from_project") }}</strong>
            </div>
          </div>
        </button>
        <div class="u-instructions">
          {{ $t("import_from_project_description") }}
        </div>
      </div>

      <div>
        <button
          type="button"
          class="u-button u-button_bleuvert _sourceBtn"
          @click="selected_source = 'resources'"
        >
          <b-icon icon="collection" />
          <div class="_sourceBtnContent">
            <div>
              <strong>{{ $t("free_resources") }}</strong>
            </div>
          </div>
        </button>
        <div class="u-instructions">
          {{ $t("free_resources_description") }}
        </div>
      </div>
    </div>

    <PickMediaFromProjects
      v-if="selected_source === 'project'"
      :title="select_mode === 'single' ? $t('pick_media') : $t('pick_medias')"
      :path="current_project_path"
      :select_mode="select_mode"
      :pick_from_types="pick_from_types"
      @pickMedias="handlePickMedias"
      @close="handleClose"
    />

    <ResourcesPicker
      v-else-if="selected_source === 'resources'"
      :project_path="current_project_path"
      :select_mode="select_mode"
      :pick_from_types="pick_from_types"
      @pickResources="handlePickResources"
      @close="handleClose"
    />
  </BaseModal2>
</template>
<script>
import ResourcesPicker from "@/components/publications/modules/ResourcesPicker.vue";

export default {
  props: {
    publication_path: String,
    select_mode: {
      type: String,
      default: "multiple",
    },
    pick_from_types: [String, Array],
  },
  components: {
    ResourcesPicker,
  },
  data() {
    return {
      selected_source: null,
    };
  },
  async created() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_project_path() {
      const all_publications_path = this.getParent(this.publication_path);
      return this.getParent(all_publications_path);
    },
  },
  methods: {
    handlePickMedias(medias) {
      this.$emit("pickMedias", medias);
    },
    handlePickResources(resources) {
      this.$emit("pickMedias", resources);
    },
    handleClose() {
      // if (this.selected_source) {
      //   // Go back to source selection
      //   this.selected_source = null;
      // } else {
      // Close the entire picker
      this.$emit("close");
      // }
    },
  },
};
</script>
<style lang="scss" scoped>
._sourceSelector {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  text-align: center;
  gap: calc(var(--spacing) / 2);
  // padding: 1rem 0;

  > * {
    flex: 1 1 0;
  }
}

._sourceBtn {
  // display: flex;
  // align-items: center;
  // gap: 1rem;
  // padding: 1.5rem;
  // text-align: left;
  // min-height: 80px;

  ._sourceBtnContent {
    // display: flex;
    // flex-direction: column;
    // gap: 0.25rem;

    // strong {
    //   font-size: 1.1rem;
    // }

    // small {
    //   opacity: 0.8;
    //   font-size: 0.9rem;
    // }
  }
}
</style>
