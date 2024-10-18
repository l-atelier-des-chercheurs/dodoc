<template>
  <BaseModal2 :title="$t('edit_informations')" @close="$emit('close')">
    <div class="_batchEditInformationsModal">
      <p class="u-instructions u-spacingBottom">
        {{ $t("edit_informations_instructions") }}
      </p>

      <select v-model="selected_option">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <div v-if="selected_option === 'new_caption'">
        <CollaborativeEditor2
          :label="$t('caption')"
          :content="''"
          :custom_formats="['bold', 'italic', 'link']"
          :is_collaborative="false"
          :can_edit="true"
          @save="
            ($event) => saveInformations({ field: 'caption', value: $event })
          "
        />

        <p v-if="saving_media_index > 0">
          {{ $t("saving") }} {{ saving_media_index }}/{{
            selected_medias.length
          }}
        </p>
      </div>
    </div>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    selected_medias: {
      type: Array,
      required: true,
    },
  },
  components: {},
  data() {
    return {
      saving_media_index: null,

      selected_option: "",
      options: [
        {
          label: this.$t("pick_an_option"),
          value: "",
        },
        {
          label: this.$t("assign_a_new_caption"),
          value: "new_caption",
        },
        {
          label: this.$t("assign_a_new_credit"),
          value: "new_credit",
        },
        {
          label: this.$t("add_or_replace_keywords"),
          value: "new_keywords",
        },
        {
          label: this.$t("add_or_replace_authors"),
          value: "new_authors",
        },
        {
          label: this.$t("assign_a_new_location"),
          value: "new_location",
        },
      ],
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async saveInformations({ field, value }) {
      this.saving_media_index = 0;
      for (const media_path of this.selected_medias) {
        debugger;
        const new_meta = {
          [field]: value,
        };
        await this.$api.updateMeta({
          path: media_path,
          new_meta,
        });
        this.saving_media_index++;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
