<template>
  <button
    type="button"
    :class="[
      'u-button',
      custom_color,
      '_tag',
      {
        'is--inactive': !clickable,
      },
      {
        'is--active2': disableable,
      },
    ]"
    @click="$emit('tagClick')"
  >
    <span class="_tagName">
      {{ name }}
    </span>
    <span class="_addBtn" v-if="addable">
      <sl-icon name="plus-circle" />
    </span>
    <span class="_removeBtn" v-if="removable" @click="$emit('removeClick')">
      <sl-icon name="trash3" />
    </span>
    <span class="_disableBtn" v-if="disableable">
      <sl-icon name="x-circle-fill" />
    </span>
  </button>
</template>
<script>
export default {
  props: {
    tag_type: String,
    name: String,
    clickable: Boolean,
    addable: Boolean,
    removable: Boolean,
    disableable: Boolean,
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
._tag {
  // border-radius: 1em;
  text-transform: none;
  padding: calc(var(--spacing) / 3) calc(var(--spacing) / 2);

  &.is--inactive {
    cursor: default;
  }
}

._addBtn,
._removeBtn,
._disableBtn {
  margin-left: 0.5em;
  line-height: 0.75;
}
</style>
