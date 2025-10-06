<template>
  <div class="_tagsList">
    <template v-if="tags.length === 0">
      <small>
        <template v-if="Array.isArray(tags)">
          {{ $t("none") }}
        </template>
        <template v-else>
          {{ $t("not_specified") }}
        </template>
      </small>
    </template>

    <transition-group v-else class="_list" name="listComplete" appear>
      <template v-if="tag_type === 'authors'">
        <AuthorTag
          v-for="tag in tags_list"
          :path="tag.$path"
          :key="tag.$path"
          :mode="tagMode(tag)"
          @click="$emit('tagClick', tag.$path)"
        />
      </template>
      <template v-else>
        <SingleTag
          v-for="tag in tags_list"
          :key="tag"
          :tag_type="tag_type"
          :tag_str="tag"
          :mode="tagMode(tag)"
          @tagClick="$emit('tagClick', tag)"
        />
      </template>
    </transition-group>

    <div class="" v-if="shorten_tag_list">
      <button
        type="button"
        class="u-buttonLink"
        v-if="show_subset"
        @click="toggleSubset"
      >
        + {{ tags.length - show_at_first }}
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
    shorten_if_too_long: {
      type: Boolean,
      default: true,
    },
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
    shorten_tag_list() {
      if (!this.shorten_if_too_long) return false;
      if (this.tags.length <= this.show_at_first) return false;
      return true;
    },
    tags_list() {
      if (this.shorten_tag_list && this.show_subset)
        return this.tags.slice(0, this.show_at_first);
      return this.tags;
    },
  },
  methods: {
    toggleSubset() {
      this.show_subset = !this.show_subset;
    },
    tagMode(tag) {
      if (this.mode) return this.mode;
      if (this.tags_active) {
        if (
          (this.tag_type === "authors" &&
            this.tags_active.includes(tag.$path)) ||
          this.tags_active.includes(tag)
        )
          return "disable";
        else return "add";
      }
      return "inactive";
    },
  },
};
</script>
<style lang="scss" scoped>
._list {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}
</style>
