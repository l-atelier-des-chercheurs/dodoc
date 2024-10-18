<template>
  <BaseModal2 :title="$t('edit_informations')" @close="$emit('close')">
    <div class="_batchEditInformationsModal">
      <p class="u-instructions u-spacingBottom">
        {{ $t("edit_informations_instructions") }}
      </p>

      <div class="u-spacingBottom">
        <DLabel :str="$t('action')" />
        <!-- <RadioCheckboxInput
          :value.sync="selected_option"
          :options="options"
          :can_edit="true"
        /> -->
        <SelectField2
          :value="selected_option"
          :options="options"
          :can_edit="true"
          @change="selected_option = $event"
        />
      </div>

      <CollaborativeEditor2
        v-if="selected_option === 'new_caption'"
        :label="$t('caption')"
        :content="''"
        :custom_formats="['bold', 'italic', 'link']"
        :is_collaborative="false"
        :can_edit="true"
        :edit_on_mounted="true"
        @save="
          ($event) => saveInformations({ field: 'caption', value: $event })
        "
      />
      <CollaborativeEditor2
        v-else-if="selected_option === 'new_credit'"
        :label="$t('credit/reference')"
        :field_to_edit="'$credits'"
        :content="''"
        :custom_formats="['bold', 'italic', 'link']"
        :is_collaborative="false"
        :can_edit="true"
        :edit_on_mounted="true"
        @save="
          ($event) => saveInformations({ field: '$credits', value: $event })
        "
      />
      <div v-else-if="selected_option === 'new_keywords'">
        <ToggleInput
          :content.sync="keep_existing_keywords"
          :label="$t('keep_existing_keywords')"
          :options="{
            true: $t('add_after_existing_keywords'),
            false: $t('erase_and_replace_keywords'),
          }"
        />
        <div class="u-spacingBottom" />
        <TagsField
          :label="$t('keywords')"
          :tag_type="'keywords'"
          :local_suggestions="keywords_suggestions"
          :content="[]"
          :can_edit="true"
          @save="($event) => saveKeywords({ field: 'keywords', value: $event })"
        />
      </div>

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

      keep_existing_keywords: true,
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
        const new_meta = {
          [field]: value,
        };
        await this.$api.updateMeta({
          path: media_path,
          new_meta,
        });
        this.saving_media_index++;
      }
      setTimeout(() => {
        this.saving_media_index = null;
      }, 2000);
    },
    async saveKeywords({ field, value }) {
      this.saving_media_index = 0;

      debugger;

      // todo : keep existing keywords
      // for (const media_path of this.selected_medias) {
      //   const new_meta = {
      //     [field]: value,
      //   };
      //   await this.$api.updateMeta({
      //     path: media_path,
      //     new_meta,
      //   });
      //   this.saving_media_index++;
      // }
      // setTimeout(() => {
      //   this.saving_media_index = null;
      // }, 2000);
    },
  },
};
</script>
<style lang="scss" scoped></style>
