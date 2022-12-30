<template>
  <BaseModal2 :title="$t('create_a_project')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createProject">
      <DLabel :str="$t('title')" />

      <TextInput
        :content.sync="new_project_title"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
      />

      <br />

      <div class="">
        <ToggleInput
          :content.sync="new_project_is_visible"
          :label="$t('invisible')"
          :options="{
            true: $t('visible_status_explanations_projects'),
            false: $t('invisible_status_explanations_projects'),
          }"
        />
      </div>

      <br />
      <!-- todo : validate properly -->
      <sl-button
        variant="primary"
        slot="footer"
        :loading="is_creating_project"
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
  props: {},
  components: {},
  data() {
    return {
      new_project_title: "",
      new_project_is_visible: true,

      is_creating_project: false,

      allow_save: false,

      error_msg: "",
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createProject() {
      this.is_creating_project = true;

      // TODO replace with $api
      try {
        const new_folder_slug = await this.$api.createFolder({
          path: `/projects`,
          additional_meta: {
            title: this.new_project_title,
            requested_slug: this.new_project_title,
            status: "draft",
            license: "CC",
            $status:
              this.new_project_is_visible === true ? "draft" : "invisible",
            $authors: [this.$api.tokenpath.token_path],
          },
        });
        setTimeout(() => {
          this.$emit("openNewProject", new_folder_slug);
        }, 50);
      } catch (err) {
        this.error_msg = "Error: " + err.message;
        setTimeout(() => {
          this.error_msg = "";
        }, 5000);
        this.is_creating_project = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
