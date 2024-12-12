<template>
  <div>
    <div @click="show_confirm_delete = true">
      <template v-if="$slots.hasOwnProperty('trigger')">
        <slot name="trigger" />
      </template>
      <template v-else>
        <button type="button" class="u-buttonLink u-buttonLink_red">
          <b-icon icon="trash" />
          <template v-if="show_button_text">
            {{ remove_text }}
          </template>
        </button>
      </template>
    </div>

    <BaseModal2
      v-if="show_confirm_delete"
      :title="remove_text"
      @close="modalClosed"
    >
      <div v-if="remove_expl">
        {{ remove_expl }}
      </div>
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
          @click="confirmRemove"
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
    remove_expl: String,
    show_button_text: {
      type: Boolean,
      default: true,
    },
    show_modal_on_startup: Boolean,
  },
  components: {},
  data() {
    return {
      show_confirm_delete: this.show_modal_on_startup === true,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    confirmRemove() {
      this.$emit("remove");
      this.show_confirm_delete = false;
    },
    modalClosed() {
      this.show_confirm_delete = false;
      this.$emit("modalClosed");
    },
  },
};
</script>
<style lang="scss" scoped></style>
