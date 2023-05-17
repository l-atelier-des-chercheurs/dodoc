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
        :name="tagName(tag)"
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
    tags_active: {
      type: Array,
      default: () => [],
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    translated: {
      type: Boolean,
      default: false,
    },
    translated_prefix: String,
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
  methods: {
    tagName(tag_str) {
      if (this.translated)
        if (this.translated_prefix)
          return this.$t(this.translated_prefix + tag_str);
        else return this.$t(tag_str);
      return tag_str;
    },
  },
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
