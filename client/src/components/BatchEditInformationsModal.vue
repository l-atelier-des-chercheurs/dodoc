<template>
  <BaseModal2 :title="$t('edit_informations')" @close="$emit('close')">
    <div class="_batchEditInformationsModal">
      <p class="u-instructions u-spacingBottom">
        {{ $t("edit_informations_instructions") }}
      </p>
      <p class="u-spacingBottom">
        {{ $t("medias_selected") }}: {{ selected_medias.length }}
      </p>

      <DetailsPane
        :header="$t('informations')"
        :icon="'info-square'"
        :is_open_initially="true"
        class="u-spacingBottom"
      >
        <div class="u-spacingBottom">
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
        </div>
        <div class="u-spacingBottom">
          <CollaborativeEditor2
            :label="$t('credit/reference')"
            :field_to_edit="'$credits'"
            :content="''"
            :custom_formats="['bold', 'italic', 'link']"
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
            @save="($event) => saveKeywords($event)"
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
            :field="'$authors'"
            :can_edit="true"
            :authors_paths="set_authors"
            :instructions="$t('file_author_instructions')"
            :no_options="true"
            @save="($event) => saveAuthors($event)"
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

      set_authors: [],
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
    async saveKeywords(value) {
      this.saving_media_index = 0;

      let keywords_to_save = value;

      // todo : keep existing keywords
      for (const media of this.selected_medias) {
        let new_keywords_list = keywords_to_save;

        if (this.keep_existing_keywords) {
          const existing_keywords = media.keywords || [];
          new_keywords_list = [...existing_keywords, ...keywords_to_save];
          new_keywords_list = [...new Set(new_keywords_list)];
        }

        await this.$api.updateMeta({
          path: media.$path,
          new_meta: { keywords: new_keywords_list },
        });
        this.saving_media_index++;
      }
      this.set_keywords = value;

      setTimeout(() => {
        this.saving_media_index = null;
      }, 2000);
    },
    async saveAuthors(value) {
      this.saving_media_index = 0;

      let authors_to_save = value;

      // todo : keep existing keywords
      for (const media of this.selected_medias) {
        let new_authors_list = authors_to_save;

        if (this.keep_existing_authors) {
          const existing_authors = media.authors || [];
          new_authors_list = [...existing_authors, ...authors_to_save];
          new_authors_list = [...new Set(new_authors_list)];
        }

        await this.$api.updateMeta({
          path: media.$path,
          new_meta: { authors: new_authors_list },
        });
        this.saving_media_index++;
      }
      this.set_authors = value;

      setTimeout(() => {
        this.saving_media_index = null;
      }, 2000);
    },
  },
};
</script>
<style lang="scss" scoped></style>
