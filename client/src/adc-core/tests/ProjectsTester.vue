<template>
  <div>
    <DLabel :str="'routine'" />

    <template v-if="!routine_is_started">
      <button
        type="button"
        class="u-button u-button_red"
        @click="startRoutine"
      >
        start
      </button>
    </template>
    <template v-else>
      <button
        type="button"
        class="u-button u-button_red"
        @click="stopRoutine"
      >
        stop routine
      </button>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    path: String,
  },
  components: {},
  data() {
    return {
      routine_is_started: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async startRoutine() {
      this.routine_is_started = true;

      const new_folder_slug = await this.$api.createFolder({
        path: this.path,
        additional_meta: {
          title: "Z test project " + +new Date(),
          $admins: "everyone",
        },
      });
      new_folder_slug;
      // await new Promise((r) => setTimeout(r, 200));
      // await this.$api.updateMeta({
      //   path: `projects/${new_folder_slug}`,
      //   new_meta: {},
      // });
      // await new Promise((r) => setTimeout(r, 200));
      // await this.$api.updateMeta({
      //   path: `/projects/${new_folder_slug}`,
      //   new_meta: {
      //     title: "Nouveau titre " + this.$api.socket.userID,
      //   },
      // });
      // await new Promise((r) => setTimeout(r, 200));
      // await this.$api.updateMeta({
      //   path: `projects/${new_folder_slug}`,
      //   new_meta: {
      //     keywords: ["plop"],
      //   },
      // });
      // await new Promise((r) => setTimeout(r, 200));
      // await this.$api.updateMeta({
      //   path: `projects/${new_folder_slug}`,
      //   new_meta: {
      //     keywords: ["plip"],
      //   },
      // });
      // await new Promise((r) => setTimeout(r, 500));
      // await this.$api.deleteItem({
      //   path: `projects/${new_folder_slug}`,
      // });
      // await new Promise((r) => setTimeout(r, 250));

      if (this.routine_is_started) this.startRoutine();
    },

    async stopRoutine() {
      this.routine_is_started = false;
    },
  },
};
</script>
<style lang="scss" scoped>
._topLabel {
  text-align: left;
}
</style>
