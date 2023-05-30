<template>
  <div class="_remix">
    <div v-if="fetch_remix_error">
      {{ fetch_remix_error }}
    </div>
    <div v-if="remix">
      <div class="_topbar">
        {{ remix.title }}
        {{ remix.$path }}
        {{ remix.type }}
        <DateDisplay :date="remix.$date_created" />
        <button type="button" class="u-button" @click="$emit('close')">
          {{ $t("close") }}
        </button>
        <button type="button" class="u-button" @click="removeRemix">
          {{ $t("remove") }}
        </button>

        <VideoAssemblage
          v-if="remix.type === 'video_assemblage'"
          :remix="remix"
        />
      </div>
    </div>
  </div>
</template>
<script>
import VideoAssemblage from "@/components/remixes/VideoAssemblage.vue";

export default {
  props: {
    project_path: String,
    make_slug: String,
  },
  components: {
    VideoAssemblage,
  },
  data() {
    return {
      remix: null,
      fetch_remix_error: false,
    };
  },
  created() {},
  async mounted() {
    await this.listRemix();
    this.$eventHub.$on("folder.removed", this.closeOnRemove);
    this.$api.join({ room: this.remix.$path });
  },
  beforeDestroy() {
    this.$eventHub.$off("folder.removed", this.closeOnRemove);
    this.$api.leave({ room: this.remix.$path });
  },
  watch: {},
  computed: {},
  methods: {
    async listRemix() {
      const remix = await this.$api
        .getFolder({
          path: `${this.project_path}/remixes/${this.make_slug}`,
        })
        .catch((err) => {
          this.fetch_remix_error = err.response;
        });
      this.remix = remix;
    },
    closeOnRemove({ path }) {
      if (path === this.remix.$path) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .log(this.$t("notifications.remix_was_removed"));
        this.$emit("close");
      }
    },
    async removeRemix() {
      this.fetch_status = "pending";
      this.fetch_error = null;
      try {
        const response = await this.$api.deleteItem({
          path: this.remix.$path,
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
._remix {
  background: white;
  margin: calc(var(--spacing) * 1) auto;
  max-width: 600px;
  padding: calc(var(--spacing) * 1);
}
</style>
