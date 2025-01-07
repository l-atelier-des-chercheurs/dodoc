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
            {{ button_text || $t("remove") }}
          </template>
        </button>
      </template>
    </div>

    <BaseModal2
      v-if="show_confirm_delete"
      :title="modal_title || button_text || $t('remove')"
      @close="modalClosed"
    >
      <div v-if="modal_expl">
        {{ modal_expl }}
      </div>
      <template v-if="$slots.hasOwnProperty('content')">
        <slot name="content" />
      </template>
      <template slot="footer">
        <button
          class="u-button"
          type="button"
          @click="show_confirm_delete = false"
        >
          <b-icon icon="x-circle" />
          {{ $t("cancel") }}
        </button>
        <button
          class="u-button u-button_red"
          type="button"
          autofocus
          @click="confirmRemove"
        >
          <b-icon icon="trash" />
          {{ $t("confirm_removal") }}
        </button>
      </template>
    </BaseModal2>
  </div>
</template>
<script>
export default {
  props: {
    button_text: String,
    modal_title: String,
    modal_expl: String,
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
