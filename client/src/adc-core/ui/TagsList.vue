<template>
  <div class="_tagsList">
    <template v-if="tags.length === 0">
      <small>
        {{ $t("none") }}
      </small>
    </template>

    <transition-group v-else class="_list" name="projectsList" appear>
      <SingleTag
        v-for="tag in tags"
        :key="tag"
        :tag_type="tag_type"
        :name="tag"
        :clickable="clickable"
        :addable="addable"
        :removable="removable"
        :disableable="tags_active.includes(tag)"
        @tagClick="$emit('tagClick', tag)"
        @removeClick="$emit('removeClick', tag)"
      />
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    tags: {
      type: Array,
      default: () => [],
    },
    tag_type: String,
    clickable: {
      type: Boolean,
      default: false,
    },
    tags_active: {
      type: Array,
      default: () => [],
    },
    addable: {
      type: Boolean,
      default: false,
    },
    removable: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._list {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 8);
}

._tagName {
  text-align: left;
}
._addBtn,
._removeBtn {
  padding: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / -4);
  margin-left: 0;
  margin-left: calc(var(--spacing) / 4);
  cursor: pointer;
}
</style>
