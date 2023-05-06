<template>
  <div class="_keywordsList">
    <template v-if="keywords.length === 0">–</template>
    <template v-else>
      <button
        type="button"
        :class="[
          'u-button',
          custom_color,
          'u-button_small',
          {
            'is--inactive': !clickable,
          },
        ]"
        v-for="kw in keywords"
        :key="kw"
        @click="$emit('tagClick', kw)"
      >
        {{ kw }}
        <span
          class="_removeBtn"
          v-if="removable"
          @click="$emit('removeClick', kw)"
        >
          <sl-icon name="trash3" />
        </span>
      </button>
    </template>
  </div>
</template>
<script>
export default {
  props: {
    keywords: Array,
    kw_type: String,
    clickable: {
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
      if (this.kw_type === "level") return "u-button_bleuvert";
      if (this.kw_type === "materials") return "u-button_bleumarine";
      if (this.kw_type === "keywords") return "u-button_orange";
      return "u-button_orange";
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._keywordsList {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 8);
}

button {
  &.is--inactive {
    cursor: default;
  }
}

._removeBtn {
  cursor: pointer;
}
</style>
