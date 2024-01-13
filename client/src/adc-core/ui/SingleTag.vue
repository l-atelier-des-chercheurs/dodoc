<template>
  <div
    class="_tag"
    :class="{
      'is--inactive': !clickable,
      'is--active2': disableable,
    }"
    :data-tagtype="tag_type"
    @click="$emit('tagClick')"
  >
    <b-icon class="_picto" :icon="icon_to_show" />

    <span class="_tagName">
      {{ name }}
    </span>
    <span class="_addBtn" v-if="addable">
      <b-icon icon="plus-circle" />
    </span>
    <span class="_removeBtn" v-if="removable" @click="$emit('removeClick')">
      <b-icon icon="x-circle" />
    </span>
    <span class="_disableBtn" v-if="disableable">
      <b-icon icon="x-circle-fill" />
    </span>
  </div>
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
  gap: calc(var(--spacing) / 4);

  border-radius: 1em;
  font-weight: 400;
  font-size: var(--sl-font-size-medium);
  text-transform: none;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 3);
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
  width: 1rem;
  height: 1rem;
  color: black;
}

._addBtn,
._removeBtn,
._disableBtn {
  margin-left: 0.5em;
  line-height: 0.75;
}
</style>
