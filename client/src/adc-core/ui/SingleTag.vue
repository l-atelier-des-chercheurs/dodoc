<template>
  <div
    class="_tag"
    :class="{
      'is--inactive': mode === 'inactive',
    }"
    :data-tagtype="tag_type"
    :data-tagvalue="tag_str"
    :data-mode="mode"
    @mouseenter="is_hovered = true"
    @mouseleave="is_hovered = false"
    @click="mode !== 'inactive' ? $emit('tagClick') : ''"
  >
    <b-icon v-if="icon_to_show" class="_picto" :icon="icon_to_show" />

    <span class="_tagName">
      {{ tag_name }}
    </span>

    <transition name="pagechange" mode="out-in">
      <b-icon
        v-if="mode === 'select'"
        icon="box-arrow-in-right"
        :aria-label="$t('select')"
        :key="'select'"
      />
      <b-icon
        v-else-if="mode === 'add'"
        icon="plus-circle"
        :aria-label="$t('add')"
        :key="'add'"
      />
      <b-icon
        v-else-if="mode === 'remove'"
        :icon="!is_hovered ? 'x-circle' : 'x-circle-fill'"
        :aria-label="$t('remove')"
        :key="'remove'"
      />
      <b-icon
        v-else-if="mode === 'disable'"
        icon="x-circle-fill"
        :aria-label="$t('disable')"
        :key="'disable'"
      />
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    tag_type: String,
    tag_str: String,
    mode: String,
  },
  components: {},
  data() {
    return {
      is_hovered: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    translated() {
      return this.isTranslated(this.tag_type);
    },
    translated_prefix() {
      return this.translatedPrefix(this.tag_type);
    },
    tag_name() {
      if (this.translated)
        if (this.translated_prefix)
          return this.$t(this.translated_prefix + this.tag_str);
        else return this.$t(this.tag_str);
      return this.tag_str;
    },
    icon_to_show() {
      if (this.tag_type === "target_audience") return "people-fill";
      if (this.tag_type === "level") return "puzzle";
      if (this.tag_type === "materials") return "bricks";
      if (this.tag_type === "machines") return "gear-wide-connected";
      if (this.tag_type === "keywords") return "tag";
      if (this.tag_type === "disciplines") return "book";
      if (this.tag_type === "accountgroup") return "diagram2";
      if (this.tag_type === "status")
        if (this.tag_str === "finished") return "check-circle-fill";
        else if (this.tag_str === "private") return "file-lock2-fill";
      return false;
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
  // font-size: var(--sl-font-size-medium);
  font-size: var(--sl-font-size-small);

  text-transform: none;

  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background-color: var(--c-gris_clair);

  &:not(.is--inactive) {
    cursor: pointer;

    &:hover,
    &:focus-visible {
      opacity: 0.8;
    }
  }

  &[data-tagtype="target_audience"] {
    background-color: var(--c-gris_fonce);
    color: white;
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
  &[data-tagtype="accountgroup"] {
    // background-color: #edbdff;
    // background-color: var(--c-bleumarine_fonce);
    color: var(--c-bleumarine_fonce);
    // color: white;
  }
  &[data-tagtype="status"] {
    &[data-tagvalue="finished"] {
      background-color: var(--c-bleuvert);
    }
    &[data-tagvalue="private"] {
      background-color: var(--c-noir);
      color: white;
    }
  }
}

._picto {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  min-width: 0;
  min-height: 0;
  color: currentColor;
}
</style>
