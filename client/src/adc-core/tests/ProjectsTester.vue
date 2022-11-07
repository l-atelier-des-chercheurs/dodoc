<template>
  <div>
    <div class="_topLabel">
      <label for="" class="u-label">routine</label>
    </div>

    <template v-if="!routine_is_started">
      <button
        type="button"
        class="u-button u-button_red u-button_big"
        @click="startRoutine"
      >
        start
      </button>
    </template>
    <template v-else>
      <button
        type="button"
        class="u-button u-button_red u-button_big"
        @click="stopRoutine"
      >
        stop routine
      </button>
    </template>
  </div>
</template>
<script>
export default {
  props: {},
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
        folder_type: "projects",
        additional_meta: {
          title: "Z test project " + this.$api.socket.userID,
          $authors: ["1-louis"],
        },
      });
      await this.$api.updateMeta({
        path: `/projects/${new_folder_slug}`,
        new_meta: {
          $authors: ["louis", "pauline"],
        },
      });
      await this.$api.updateMeta({
        path: `/projects/${new_folder_slug}`,
        new_meta: {
          title: "Nouveau titre " + this.$api.socket.userID,
        },
      });
      await this.$api.updateMeta({
        path: `/projects/${new_folder_slug}`,
        new_meta: {
          keywords: ["plop"],
        },
      });
      await this.$api.updateMeta({
        path: `/projects/${new_folder_slug}`,
        new_meta: {
          keywords: ["plip"],
        },
      });
      await new Promise((r) => setTimeout(r, 500));
      await this.$api.deleteFolder({
        folder_type: "projects",
        folder_slug: new_folder_slug,
      });
      await new Promise((r) => setTimeout(r, 250));

      if (this.routine_is_started) this.startRoutine();
    },

    async stopRoutine() {
      this.routine_is_started = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
