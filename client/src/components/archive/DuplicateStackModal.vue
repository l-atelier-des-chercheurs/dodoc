<template>
  <BaseModal2 :title="$t('duplicate_stack')" @close="$emit('close')">
    <div class="u-spacingBottom">
      <DLabel :str="$t('new_title')" />
      <TextInput :content.sync="new_title" :required="true" ref="titleInput" />

      <div class="u-spacingBottom" />

      <div class="">
        <DLabel :str="$t('destination_corpus')" />
        <DestinationCorpusSelector
          :selected_destination_folder_path.sync="
            selected_destination_folder_path
          "
        />
      </div>

      <div class="u-spacingBottom" />

      <div>
        <ToggleInput
          :content.sync="remove_original"
          :label="$t('remove_original')"
          :options="{
            true: $t('remove_original_after_copy'),
            false: $t('keep_original_after_copy'),
          }"
        />
      </div>
    </div>

    <template #footer>
      <div />
      <button
        type="button"
        :disabled="is_copying"
        class="u-button u-button_bleuvert"
        @click="duplicateOrMoveStack"
      >
        <template v-if="remove_original">
          {{ $t("move") }}
        </template>
        <template v-else>
          {{ $t("duplicate") }}
        </template>
      </button>

      <LoaderSpinner v-if="is_copying" />
    </template>
  </BaseModal2>
</template>
<script>
import DestinationCorpusSelector from "@/components/DestinationCorpusSelector.vue";

export default {
  props: {
    stack: {
      type: Object,
      required: true,
    },
  },
  components: {
    DestinationCorpusSelector,
  },
  data() {
    return {
      selected_destination_folder_path: "",
      new_title: this.stack.title,
      remove_original: false,
      is_copying: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        new_title: "Nouveau titre",
        duplicate_stack: "Dupliquer ou déplacer la pile",
        destination_corpus: "Corpus de destination",
      },
      en: {
        new_title: "New title",
        duplicate_stack: "Duplicate or move the stack",
        destination_corpus: "Destination corpus",
      },
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async duplicateOrMoveStack() {
      this.is_copying = true;

      const new_folder_path = await this.$api.copyFolder({
        path: this.stack.$path,
        path_to_destination_type:
          this.selected_destination_folder_path + "/stacks",
        is_copy_or_move: this.remove_original ? "move" : "copy",
        new_meta: {
          title: this.new_title,
        },
      });

      if (this.remove_original) {
        await this.$api.deleteItem({
          path: this.stack.$path,
        });
      }

      this.is_copying = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
