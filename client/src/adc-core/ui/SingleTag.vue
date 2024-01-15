<template>
  <div
    class="_tag"
    :class="{
      'is--inactive': mode === 'inactive',
    }"
    :data-tagtype="tag_type"
    @click="$emit('tagClick')"
  >
    <b-icon class="_picto" :icon="icon_to_show" />

    <span class="_tagName">
      {{ name }}
    </span>

    <transition name="pagechange" mode="out-in">
      <b-icon v-if="mode === 'add'" icon="plus-circle" :key="mode" />
      <b-icon v-else-if="mode === 'remove'" icon="x-circle" :key="mode" />
      <b-icon v-else-if="mode === 'disable'" icon="x-circle-fill" :key="mode" />
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    tag_type: String,
    name: String,
    mode: String,
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
      if (this.tag_type === "disciplines") return "u-button_rouge";
      return "";
    },
    icon_to_show() {
      if (this.tag_type === "level") return "puzzle";
      if (this.tag_type === "materials") return "bricks";
      if (this.tag_type === "machines") return "gear-wide-connected";
      if (this.tag_type === "keywords") return "tag";
      if (this.tag_type === "disciplines") return "book";
      return "";
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._tag {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  gap: calc(var(--spacing) / 8);

  border-radius: 1em;
  font-weight: 400;
  // font-size: var(--sl-font-size-medium);
  font-size: var(--sl-font-size-small);

  text-transform: none;

  padding: calc(var(--spacing) / 8) calc(var(--spacing) / 3);
  background-color: var(--c-gris_clair);

  &:not(.is--inactive) {
    cursor: pointer;

    &:hover,
    &:focus-visible {
      opacity: 0.8;
    }
  }

  &[data-tagtype="level"] {
    background-color: var(--c-rouge_clair);
  }
  &[data-tagtype="disciplines"] {
    background-color: var(--c-rouge_clair);
  }
  &[data-tagtype="keywords"] {
    background-color: var(--c-orange_clair);
  }
  &[data-tagtype="machines"] {
    background-color: var(--c-bleuvert_clair);
  }
  &[data-tagtype="materials"] {
    background-color: var(--c-bleumarine_clair);
  }
}

._picto {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  min-width: 0;
  min-height: 0;
  color: black;
}
</style>
