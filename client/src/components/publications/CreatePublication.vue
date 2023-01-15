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
            v-text="option.label"
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
          :content.sync="new_publication_is_invisible"
          :label="$t('invisible')"
          :options="{
            true: $t('invisible_status_explanations_publis'),
            false: $t('visible_status_explanations_publis'),
          }"
        />
      </div>

      <br />
      <!-- todo : validate properly -->
      <button
        class="u-button u-button_bleuvert"
        type="submit"
        slot="footer"
        :loading="is_creating_publication"
      >
        {{ $t("create_and_open") }}
      </button>

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
      new_publication_is_invisible: true,
      new_publication_template: "story",

      is_creating_publication: false,

      allow_save: false,

      template_options: [
        {
          key: "story",
          label: this.$t("story"),
        },
        {
          key: "page_by_page",
          label: this.$t("page_by_page"),
          // disabled: true,
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

      let additional_meta = {
        title: this.new_publication_title,
        template: this.new_publication_template,
        requested_slug: this.new_publication_title,
        $status:
          this.new_publication_is_invisible === true ? "invisible" : "draft",
        $authors: [this.$api.tokenpath.token_path],
      };

      if (this.new_publication_template === "page_by_page")
        additional_meta.format = "A4_portrait";

      // TODO replace with $api
      try {
        const new_folder_slug = await this.$api.createFolder({
          path: `${this.project_path}/publications`,
          additional_meta,
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
