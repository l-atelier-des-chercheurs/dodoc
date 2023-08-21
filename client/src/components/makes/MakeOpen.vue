<template>
  <div class="_make">
    <div v-if="fetch_make_error">
      {{ fetch_make_error }}
    </div>
    <div v-if="make">
      <div class="_topbar">
        <DateDisplay :date="make.$date_created" />
        <button type="button" class="u-button" @click="$emit('close')">
          {{ $t("close") }}
        </button>
        <button type="button" class="u-button" @click="removeMake">
          {{ $t("remove") }}
        </button>
      </div>
      <hr />
      <VideoAssemblage v-if="make.type === 'video_assemblage'" :make="make" />
      <CropImage v-else-if="make.type === 'edit_image'" :make="make" />
    </div>
  </div>
</template>
<script>
import VideoAssemblage from "@/components/makes/VideoAssemblage.vue";
import CropImage from "@/components/makes/CropImage.vue";

export default {
  props: {
    project_path: String,
    make_slug: String,
  },
  components: {
    VideoAssemblage,
    CropImage,
  },
  data() {
    return {
      make: null,
      fetch_make_error: false,
    };
  },
  created() {},
  async mounted() {
    await this.listMake();
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.make.$path });
  },
  beforeDestroy() {
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
    this.$api.leave({ room: this.make.$path });
  },
  watch: {},
  computed: {},
  methods: {
    async listMake() {
      const make = await this.$api
        .getFolder({
          path: `${this.project_path}/makes/${this.make_slug}`,
        })
        .catch((err) => {
          this.fetch_make_error = err.response;
        });
      this.make = make;
    },
    closeOnRemove({ path }) {
      if (path === this.make.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.make_was_removed"));
        this.$emit("close");
      }
    },
    async removeMake() {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const response = await this.$api.deleteItem({
          path: this.make.$path,
        });
        this.response = response.data;
        this.fetch_status = "success";
      } catch (e) {
        this.fetch_status = "error";
        this.fetch_error = e.response.data;
        // this.$alertify.delay(4000).error(err);
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._make {
  background: white;
  margin: calc(var(--spacing) * 1) auto;
  // max-width: 600px;
  padding: calc(var(--spacing) * 1);
}
</style>
