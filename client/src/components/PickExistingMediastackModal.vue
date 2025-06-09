<template>
  <BaseModal2
    :title="modal_title || $t('pick_existing_mediastack')"
    :is_closable="true"
    :size="'large'"
    @close="$emit('close')"
  >
    <div class="_pickExistingMediastackModal">
      <!-- <div class="u-spacingBottom">
        <DLabel :str="$t('corpus')" />
        <DestinationCorpusSelector
          :selected_destination_folder_path.sync="
            selected_destination_folder_path
          "
        />
      </div> -->

      <transition name="pagechange" mode="out-in">
        <div
          v-if="selected_destination_folder_path"
          :key="selected_destination_folder_path"
          class="_stackPickerFrame"
        >
          <SharedFolder2
            :shared_folder_path="selected_destination_folder_path"
            :select_mode="select_mode"
            @changeCorpus="changeCorpus"
            @selectMedias="$emit('mediasSelected', $event)"
            @selectStack="$emit('stackSelected', $event)"
          />
        </div>
      </transition>
    </div>
  </BaseModal2>
</template>
<script>
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  props: {
    modal_title: String,
    select_mode: {
      type: String,
      default: "single_stack",
    },
  },
  components: {
    DestinationCorpusSelector,
    SharedFolder2: () => import("@/components/archive/SharedFolder2.vue"),
  },
  data() {
    return {
      selected_destination_folder_path: undefined,
    };
  },
  i18n: {
    messages: {
      fr: {
        pick_existing_mediastack: "Choisir un corpus existant",
        corpus: "Corpus",
      },
      en: {
        pick_existing_mediastack: "Pick existing mediastack",
        corpus: "Corpus",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    changeCorpus(path) {
      debugger;
      this.selected_destination_folder_path = path;
    },
  },
};
</script>
<style lang="scss" scoped>
._pickExistingMediastackModal {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);

  > * {
    flex: 1 1 auto;
  }
}

._stackPickerFrame {
  border: 1px solid var(--c-gris);
  // border-radius: var(--input-border-radius);
  overflow: auto;
  height: 70dvh;
}
</style>
