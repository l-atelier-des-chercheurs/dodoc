<template>
  <BaseModal2 :title="$t('create_a_publication')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createPublication">
      <DLabel :str="$t('title')" />
      <TextInput
        :content.sync="new_publication_title"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="">
        <select v-model="new_publication_template">
          <option
            v-for="option in template_options"
            :key="option.key"
            :value="option.key"
            v-text="$t(option.key)"
            :disabled="option.disabled"
          />
        </select>

        <div v-if="false">
          <small v-html="$t(instructions)" />
        </div>
      </div>

      <br />

      <div class="">
        <ToggleInput
          :content.sync="new_publication_is_public"
          :label="$t('public')"
          :options="{
            true: $t('public_status_explanations'),
            false: $t('not_public_status_explanations'),
          }"
        />
      </div>

      <br />
      <!-- todo : validate properly -->
      <sl-button
        variant="primary"
        slot="footer"
        :loading="is_creating_publication"
        type="submit"
      >
        {{ $t("create_and_open") }}
      </sl-button>

      <template v-if="error_msg">
        <br />
        <br />
        <div class="u-errorMsg" v-text="error_msg" />
      </template>
    </form>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    project_path: String,
  },
  components: {},
  data() {
    return {
      new_publication_title: "",
      new_publication_is_public: true,
      new_publication_template: "story",

      is_creating_publication: false,

      allow_save: false,

      template_options: [
        {
          key: "story",
          text: "story",
        },
        {
          key: "page_by_page",
          text: "page_by_page",
          disabled: true,
        },
      ],

      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createPublication() {
      this.is_creating_publication = true;

      // TODO replace with $api
      try {
        const new_folder_slug = await this.$api.createFolder({
          path: `${this.project_path}/publications`,
          additional_meta: {
            title: this.new_publication_title,
            template: this.new_publication_template,
            requested_slug: this.new_publication_title,
            $public: this.new_publication_is_public,
            $authors: [this.$api.tokenpath.token_path],
          },
        });
        this.$emit("openPubli", new_folder_slug);
      } catch (err) {
        this.error_msg = "Error: " + err.message;
        setTimeout(() => {
          this.error_msg = "";
        }, 5000);
        this.is_creating_publication = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
