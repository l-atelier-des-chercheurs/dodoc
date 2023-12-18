<template>
  <div class="_documentsCreator">
    <transition-group tag="div" name="projectsList">
      <DocumentSpot
        v-for="stack in sorted_stacks"
        :key="stack.$path"
        :selected_items="selected_items"
        :author_stacks_path="author_stacks_path"
        :mode="spot_mode"
        :stack_path="stack.$path"
        :stack="stack"
      />
      <div :key="'empty'">
        <transition name="slideupFade">
          <DocumentSpot
            v-if="spot_mode === 'add'"
            :author_stacks_path="author_stacks_path"
            :selected_items="selected_items"
          />
        </transition>
      </div>
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
      is_expecting_drag: false,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  async created() {
    await this.listStacks();
    this.$api.join({ room: this.author_stacks_path });
    this.is_loading = false;

    this.$eventHub.$on("chutierItem.startDrag", this.startDragItem);
    this.$eventHub.$on("chutierItem.endDrag", this.endDragItem);
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.author_stacks_path });

    this.$eventHub.$off("chutierItem.startDrag", this.startDragItem);
    this.$eventHub.$off("chutierItem.endDrag", this.endDragItem);
  },
  watch: {},
  computed: {
    spot_mode() {
      if (this.is_expecting_drag || this.selected_items?.length > 0)
        return "add";
      return "open";
    },
    sorted_stacks() {
      return this.all_stacks
        .slice()
        .sort(
          (a, b) => +new Date(a.$date_created) - +new Date(b.$date_created)
        );
    },
  },
  methods: {
    startDragItem() {
      this.is_expecting_drag = true;
    },
    endDragItem() {
      this.is_expecting_drag = false;
    },

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
  border-left: 1px solid #424146;
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
