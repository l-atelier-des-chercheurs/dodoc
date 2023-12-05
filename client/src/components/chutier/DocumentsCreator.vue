<template>
  <div class="_documentsCreator">
    <!-- <span>
      {{ $t("publier") }}
    </span> -->
    <DocumentSpot
      v-for="stack in all_stacks"
      :key="stack.$path"
      class="_spot"
      :author_stacks_path="author_stacks_path"
      :stack_path="stack.$path"
    />
    <DocumentSpot
      :author_stacks_path="author_stacks_path"
      :key="'empty'"
      class="_spot"
    />
  </div>
</template>
<script>
import DocumentSpot from "@/components/chutier/DocumentSpot.vue";

export default {
  props: {
    author_stacks_path: String,
    has_items_selected: Boolean,
  },
  components: {
    DocumentSpot,
  },
  data() {
    return {
      is_loading: true,
      all_stacks: [],
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
      this.all_stacks = await this.$api
        .getFolders({
          path: this.author_stacks_path,
        })
        .catch((err) => {
          this.fetch_project_error = err.response;
          this.is_loading = false;
        });
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
  justify-content: flex-start;
  height: 100%;
  overflow: auto;

  > span {
  }
}
</style>
