<template>
  <BaseModal2 :title="$t('edit_informations')" @close="$emit('close')">
    <div class="_batchEditInformationsModal">
      <p class="u-instructions u-spacingBottom">
        {{ $t("edit_informations_instructions") }}
      </p>
      <p class="u-spacingBottom">
        {{ selected_medias.length }} {{ $t("medias_selected").toLowerCase() }}
      </p>

      <DetailsPane
        :header="$t('informations')"
        :icon="'info-square'"
        :is_open_initially="true"
        class="u-spacingBottom"
      >
        <div class="u-spacingBottom">
          <DLabel :str="$t('caption')" />
          <CollaborativeEditor3
            :content="''"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :is_collaborative="false"
            :can_edit="true"
            @save="
              ($event) => saveInformations({ field: 'caption', value: $event })
            "
          />
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('credit/reference')" />
          <CollaborativeEditor3
            :field_to_edit="'$credits'"
            :content="''"
            :custom_formats="['bold', 'italic', 'link', 'emoji']"
            :is_collaborative="false"
            :can_edit="true"
            @save="
              ($event) => saveInformations({ field: '$credits', value: $event })
            "
          />
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('keywords')" />
          <ToggleInput
            :content.sync="keep_existing_keywords"
            :label="$t('keep_existing_keywords')"
            :options="{
              true: $t('add_after_existing_keywords'),
              false: $t('erase_and_replace_keywords'),
            }"
          />
          <TagsField
            :tag_type="'keywords'"
            :local_suggestions="keywords_suggestions"
            :content="set_keywords"
            :can_edit="true"
            @save="($event) => saveArray($event, 'keywords')"
          />
        </div>
        <div class="u-spacingBottom">
          <DLabel :str="$t('authors')" />
          <ToggleInput
            :content.sync="keep_existing_authors"
            :label="$t('keep_existing_authors')"
            :options="{
              true: $t('add_after_existing_authors'),
              false: $t('erase_and_replace_authors'),
            }"
          />
          <AuthorField
            :can_edit="true"
            :authors_paths="set_$authors"
            :instructions="$t('file_author_instructions')"
            :no_options="true"
            @save="($event) => saveArray($event, '$authors')"
          />
        </div>
        <div class="">
          <PositionPicker
            :label="$t('location')"
            :can_edit="true"
            :content="set_location"
            @newPosition="
              ($event) =>
                saveInformations({ field: '$location', value: $event })
            "
          />
        </div>
      </DetailsPane>

      <template v-if="saving_media_index > 0">
        <hr />
        <p>
          {{ $t("saving") }} {{ saving_media_index }}/{{
            selected_medias.length
          }}
        </p>
      </template>
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
    keywords_suggestions: {
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
          key: "",
          text: this.$t("pick_an_option"),
        },
        {
          key: "new_caption",
          text: this.$t("assign_a_new_caption"),
        },
        {
          key: "new_credit",
          text: this.$t("assign_a_new_credit"),
        },
        {
          key: "new_keywords",
          text: this.$t("add_or_replace_keywords"),
        },
        {
          key: "new_location",
          text: this.$t("assign_a_new_location"),
        },
      ],

      set_location: null,

      set_keywords: [],
      keep_existing_keywords: true,

      set_$authors: [],
      keep_existing_authors: true,
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

      for (const media of this.selected_medias) {
        const new_meta = {
          [field]: value,
        };
        await this.$api.updateMeta({
          path: media.$path,
          new_meta,
        });
        this.saving_media_index++;

        if (field === "$location") {
          this.set_location = value;
        }
      }
      setTimeout(() => {
        this.saving_media_index = null;
      }, 2000);
    },
    async saveArray(value, field) {
      this.saving_media_index = 0;

      let array_to_save = value;

      // todo : keep existing keywords
      for (const media of this.selected_medias) {
        let new_array = array_to_save;

        if (this[`keep_existing_${field}`]) {
          const existing_array = media[field] || [];
          new_array = [...existing_array, ...array_to_save];
          new_array = [...new Set(new_array)];
        }

        await this.$api.updateMeta({
          path: media.$path,
          new_meta: { [field]: new_array },
        });
        this.saving_media_index++;
      }
      this.$set(this, `set_${field}`, value);

      setTimeout(() => {
        this.saving_media_index = null;
      }, 2000);
    },
  },
};
</script>
<style lang="scss" scoped></style>
