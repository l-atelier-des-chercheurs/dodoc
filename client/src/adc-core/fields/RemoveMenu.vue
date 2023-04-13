<template>
  <div>
    <button
      type="button"
      class="u-buttonLink"
      @click="show_confirm_delete = true"
    >
      <sl-icon name="trash3" />
      <template v-if="show_button_text">
        {{ remove_text }}
      </template>
    </button>

    <BaseModal2
      v-if="show_confirm_delete"
      :title="remove_text"
      @close="show_confirm_delete = false"
    >
      <div class="u-sameRow" slot="footer">
        <button
          type="button"
          class="u-buttonLink"
          @click="show_confirm_delete = false"
        >
          {{ $t("cancel") }}
        </button>
        <button
          class="u-button u-button_red"
          type="button"
          autofocus
          @click="$emit('remove')"
        >
          {{ $t("confirm_removal") }}
        </button>
      </div>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    remove_text: String,
    show_button_text: {
      type: Boolean,
      default: true,
    },
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
