<template>
  <div class="_documentsCreator">
    <!-- <span>
      {{ $t("publier") }}
    </span> -->
    <template v-for="(a, index) in new Array(3).fill(null)">
      <DocumentSpot
        class="_spot"
        :key="index"
        :index="index + 1"
        :author_stacks_path="author_stacks_path"
        :stack_path="stackPathForIndex(index + 1)"
      />
    </template>
  </div>
</template>
<script>
import DocumentSpot from "@/components/DocumentSpot.vue";

export default {
  props: { author_stacks_path: String },
  components: {
    DocumentSpot,
  },
  data() {
    return {
      is_loading: true,
      stacks: [],
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {
    this.listStacks();
    this.$api.join({ room: this.author_stacks_path });
    this.is_loading = false;
  },
  beforeDestroy() {
    this.$api.leave({ room: this.author_stacks_path });
  },
  watch: {},
  computed: {},
  methods: {
    async listStacks() {
      this.stacks = await this.$api
        .getFolders({
          path: this.author_stacks_path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
    },
    stackPathForIndex(index) {
      const stack = this.stacks.find((s) => s.stack_spot === index);
      if (stack) return stack.$path;
      return undefined;
    },
  },
};
</script>
<style lang="scss" scoped>
._documentsCreator {
  color: #999;
  background: #222;
  padding: calc(var(--spacing) / 1);
  width: auto;

  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  height: 100%;
  overflow: auto;

  > span {
  }
}
</style>
