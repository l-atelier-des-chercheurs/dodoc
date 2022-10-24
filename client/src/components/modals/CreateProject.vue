<template>
  <BaseModal2 :title="$t('create_a_project')" @close="$emit('close')">
    <form class="input-validation-required" @submit.prevent="createProject">
      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("title") }}</label>
      </div>
      <TextInput
        :content.sync="new_project_title"
        :maxlength="40"
        :required="true"
        @toggleValidity="($event) => (allow_save = $event)"
        @onEnter="createProject"
      />

      <br />

      <sl-switch>{{ $t("invisible") }}</sl-switch>
      <div>
        <small>{{ $t("invisible_status_explanations") }}</small>
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
      is_creating_project: false,

      allow_save: false,
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
          folder_type: "projects",
          additional_meta: {
            title: this.new_project_title,
            requested_folder_name: this.new_project_title,
            status: "draft",
          },
        });
        this.is_creating_project = false;

        setTimeout(() => {
          this.$emit("openNewProject", new_folder_slug);
        }, 500);
      } catch (e) {
        this.$alertify.closeLogOnClick(true).delay(4000).error(e.response.data);
        this.is_creating_project = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
