<template>
  <sl-dialog ref="createModal" label="Créer un projet" class="">
    <form class="input-validation-required" @submit.prevent="createProject">
      <sl-input
        type="text"
        autofocus
        placeholder="Titre du nouveau projet"
        v-sl-model="new_project_title"
        required
      />
      <!-- todo : validate properly -->
      <sl-button
        variant="primary"
        slot="footer"
        :loading="is_creating_project"
        type="submit"
      >
        créer
      </sl-button>
    </form>
  </sl-dialog>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      new_project_title: "",
      is_creating_project: false,
    };
  },
  created() {},
  mounted() {
    this.$el.show();
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async createProject() {
      this.is_creating_project = true;

      // TODO replace with $api
      try {
        await this.$axios.post("/projects", {
          title: this.new_project_title,
          requested_folder_name: this.new_project_title,
          status: "current",
        });
        this.is_creating_project = false;
        this.$el.hide();

        setTimeout(() => {
          this.$emit("close");
        }, 500);

        this.new_project_title = "";
      } catch (e) {
        this.$alertify.closeLogOnClick(true).delay(4000).error(e.response.data);
        this.is_creating_project = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
