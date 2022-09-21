<template>
  <div class="_project">
    <strong>
      {{ project.title }}
    </strong>
    {{ project.description }}
    <br />
    <DateField :title="'date_created'" :date="project.date_created" />
    <br />
    <!-- <input type="text" v-model="new_title" />
    <button type="button" class="button" @click="updateProject">save</button> -->

    <router-link :to="`/projects/${project.slug}`" class="">
      <sl-button size="small" variant="primary" pill>ouvrir</sl-button>
    </router-link>
    <sl-button size="small" variant="default" @click="removeProject" pill>
      supprimer
    </sl-button>

    <!-- fetch_status = {{ fetch_status }} <br />
    fetch_error = {{ fetch_error }} <br />
    response = {{ response }} <br /> -->
  </div>
</template>
<script>
export default {
  props: {
    project: Object,
  },
  components: {},
  data() {
    return {
      new_title: this.project.title,

      fetch_status: null,
      fetch_error: null,
      response: null,

      show_lib: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async updateProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      // TODO use updateItem

      try {
        const response = await this.$axios.patch(
          `/projects/${this.project.slug}`,
          {
            title: this.new_title,
          }
        );

        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
    async removeProject() {
      this.fetch_status = "pending";
      this.fetch_error = null;

      try {
        const response = await this.$axios.delete(
          `/projects/${this.project.slug}`
        );
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._project {
  position: relative;
  border: 1px solid black;
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
}

._editBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
