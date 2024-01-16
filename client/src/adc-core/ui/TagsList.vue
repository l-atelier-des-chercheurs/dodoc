<template>
  <div class="_tagsList">
    <template v-if="tags.length === 0">
      <small>
        {{ $t("none") }}
      </small>
    </template>

    <transition-group v-else class="_list" name="projectsList" appear>
      <SingleTag
        v-for="tag in tags_list"
        :key="tag"
        :tag_type="tag_type"
        :tag_str="tag"
        :mode="tagMode(tag)"
        @tagClick="$emit('tagClick', tag)"
      />
    </transition-group>

    <div class="">
      <button
        type="button"
        class="u-buttonLink"
        v-if="show_subset"
        @click="toggleSubset"
      >
        <b-icon icon="arrow-down-short" />
        {{ $t("show_all") }}
      </button>
      <button type="button" class="u-buttonLink" v-else @click="toggleSubset">
        <b-icon icon="arrow-up-short" />
        {{ $t("hide") }}
      </button>
    </div>
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
    mode: String,
  },
  components: {},
  data() {
    return {
      show_subset: true,
      show_at_first: 5,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    tags_list() {
      if (this.show_subset) return this.tags.slice(0, this.show_at_first);
      return this.tags;
    },
  },
  methods: {
    toggleSubset() {
      this.show_subset = !this.show_subset;
    },
    tagMode(tag) {
      if (this.mode) return this.mode;
      if (this.tags_active)
        if (this.tags_active.includes(tag)) return "disable";
        else return "select";
      return "inactive";
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
._addBtn,
._removeBtn {
  padding: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / -4);
  margin-left: 0;
  margin-left: calc(var(--spacing) / 4);
  cursor: pointer;
}
</style>
