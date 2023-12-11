<template>
  <div class="_documentsCreator">
    <transition-group tag="div" name="projectsList">
      <DocumentSpot
        v-for="stack in all_stacks"
        :key="stack.$path"
        :selected_items="selected_items"
        :author_stacks_path="author_stacks_path"
        :stack_path="stack.$path"
        :stack="stack"
      />
      <DocumentSpot
        :author_stacks_path="author_stacks_path"
        :key="'empty'"
        :selected_items="selected_items"
      />
    </transition-group>
  </div>
</template>
<script>
import DocumentSpot from "@/components/chutier/DocumentSpot.vue";

export default {
  props: {
    author_stacks_path: String,
    selected_items: Array,
  },
  components: {
    DocumentSpot,
  },
  data() {
    return {
      is_loading: true,
      fetch_stack_err: undefined,
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
          this.fetch_stack_err = err.response;
          this.is_loading = false;
        });
    },
  },
};
</script>
<style lang="scss" scoped>
._documentsCreator {
  color: white;
  // padding: calc(var(--spacing) / 1);
  width: auto;

  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;

  height: 100%;
  overflow: auto;
  border-left: 1px solid #777;
  padding: calc(var(--spacing) / 2) 0;

  > span {
  }

  ::v-deep > *:only-child {
    height: 50%;
    ._documentSpot {
      height: 100%;
    }
  }
}

// no working in safari :(
// @supports (justify-content: safe center) {
//   ._documentsCreator {
//     justify-content: safe center;
//   }
// }
</style>
