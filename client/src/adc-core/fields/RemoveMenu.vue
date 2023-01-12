<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      v-if="!show_confirm_delete"
      @click="show_confirm_delete = true"
    >
      {{ remove_text }}
    </button>

    <fieldset v-if="show_confirm_delete">
      <legend class="u-label">{{ remove_text }}</legend>
      <button
        type="button"
        class="u-buttonLink"
        @click="show_confirm_delete = false"
      >
        {{ $t("cancel") }}
      </button>
      <br />
      <br />
      <button
        class="u-button u-button_red"
        type="button"
        @click="$emit('remove')"
      >
        {{ $t("confirm_removal") }}
      </button>
    </fieldset>
  </div>
</template>
<script>
export default {
  props: {
    remove_text: String,
  },
  components: {},
  data() {
    return {
      show_confirm_delete: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
