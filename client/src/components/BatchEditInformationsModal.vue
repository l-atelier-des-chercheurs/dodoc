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
            @input="($event) => saveInformations({ field: 'caption', value: $event })"
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
            @input="
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
    <template #footer>
      <SaveCancelButtons
        :is_saving="is_saving"
        :allow_save="allow_save"
        @save="saveAllInformations"
        @cancel="$emit('close')"
      />
    </template>
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
  components: {
    PositionPicker: () => import("@/adc-core/inputs/PositionPicker.vue"),
  },
  data() {
    return {
      saving_media_index: null,
      is_saving: false,

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

      draft_updates: {},
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    allow_save() {
      return Object.keys(this.draft_updates).length > 0;
    },
  },
  methods: {
    saveInformations({ field, value }) {
      this.$set(this.draft_updates, field, value);

      if (field === "$location") this.set_location = value;
    },
    saveArray(value, field) {
      if (field === "keywords") this.set_keywords = value;
      if (field === "$authors") this.set_$authors = value;
      this.$set(this.draft_updates, field, value);
    },
    shouldKeepExisting(field) {
      if (field === "keywords") return this.keep_existing_keywords;
      if (field === "$authors") return this.keep_existing_authors;
      return false;
    },
    async saveAllInformations() {
      if (!this.allow_save || this.is_saving) return;

      this.is_saving = true;
      this.saving_media_index = 0;

      try {
        for (const media of this.selected_medias) {
          const new_meta = {};

          for (const [field, value] of Object.entries(this.draft_updates)) {
            if (Array.isArray(value)) {
              let new_array = value;
              if (this.shouldKeepExisting(field)) {
                const existing_array = media[field] || [];
                new_array = [...new Set([...existing_array, ...value])];
              }
              new_meta[field] = new_array;
            } else {
              new_meta[field] = value;
            }
          }

          await this.$api.updateMeta({
            path: media.$path,
            new_meta,
          });
          this.saving_media_index++;
        }

        this.$emit("close");
      } finally {
        this.is_saving = false;
        setTimeout(() => {
          this.saving_media_index = null;
        }, 2000);
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
