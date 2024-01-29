<template>
  <sl-dropdown class="_dropDown" @sl-show="$emit('show')">
    <button type="button" class="u-button u-button_small" slot="trigger">
      <template v-if="$slots.hasOwnProperty('trigger')">
        <slot name="trigger" />
      </template>
      <template v-else>
        {{ $t("options") }}
      </template>
      <!-- <b-icon icon="caret-down" /> -->
      <span class="_caret" />
    </button>
    <sl-menu>
      <sl-menu-item v-if="$slots.hasOwnProperty('item1')">
        <slot name="item1" />
      </sl-menu-item>
      <sl-menu-item v-if="$slots.hasOwnProperty('item2')">
        <slot name="item2" />
      </sl-menu-item>
      <sl-menu-item v-if="$slots.hasOwnProperty('item3')">
        <slot name="item3" />
      </sl-menu-item>
      <sl-menu-item v-if="$slots.hasOwnProperty('item4')">
        <slot name="item4" />
      </sl-menu-item>
    </sl-menu>
  </sl-dropdown>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
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
._dropDown {
  &::part(panel) {
    background: white;
  }
}

._caret {
  display: block;

  width: 1.5rem;
  height: 1rem;

  background-image: url("data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg width='41px' height='26px' viewBox='0 0 41 26' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'%3E%3Cdefs%3E%3C/defs%3E%3Cg id='Page-1' stroke='none' stroke-width='1' fill='none' fill-rule='evenodd'%3E%3Cpolygon id='Path-3' fill='%23000000' points='0 5.38215461 19.9830489 25.3652035 40.1398855 5.20836689 34.9315186 0 19.8691842 15.0623344 4.83971338 0.0328636246'%3E%3C/polygon%3E%3C/g%3E%3C/svg%3E%0A");
  background-position: right 0.4rem center;
  background-repeat: no-repeat;
  background-size: 0.75rem;
}
</style>
