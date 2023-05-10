<template>
  <div class="_tagsList">
    <template v-if="tags.length === 0">
      <small>
        {{ $t("none") }}
      </small>
    </template>

    <transition-group v-else class="_list" name="projectsList" appear>
      <button
        type="button"
        :class="[
          'u-button',
          custom_color,
          'u-button_small',
          '_tag',
          {
            'is--inactive': !clickable,
          },
        ]"
        v-for="kw in tags"
        :key="kw"
        @click="$emit('tagClick', kw)"
      >
        <span class="_tagName">
          {{ kw }}
        </span>
        <span class="_addBtn" v-if="addable">
          <sl-icon name="plus-circle" />
        </span>
        <span
          class="_removeBtn"
          v-if="removable"
          @click="$emit('removeClick', kw)"
        >
          <sl-icon name="trash3" />
        </span>
      </button>
    </transition-group>
  </div>
</template>
<script>
export default {
  props: {
    tags: Array,
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
  computed: {
    custom_color() {
      if (this.tag_type === "level") return "u-button_red";
      if (this.tag_type === "materials") return "u-button_bleumarine";
      if (this.tag_type === "machines") return "u-button_bleuvert";
      if (this.tag_type === "keywords") return "u-button_orange";
      return "u-button_orange";
    },
  },
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
