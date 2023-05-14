<template>
  <div class="_tagsList">
    <template v-if="tags.length === 0">
      <small>
        {{ $t("none") }}
      </small>
    </template>

    <transition-group v-else class="_list" name="projectsList" appear>
      <SingleTag
        v-for="kw in tags"
        :key="kw"
        :tag_type="tag_type"
        :name="kw"
        :clickable="clickable"
        :addable="addable"
        :removable="removable"
        @tagClick="$emit('tagClick')"
        @removeClick="$emit('removeClick')"
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

._tag {
  border-radius: 1em;
  text-transform: none;

  &.is--inactive {
    cursor: default;
  }
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
