<template>
  <BaseModal2 :title="modal_title || $t('remove')" @close="$emit('close')">
    <div v-if="modal_expl">
      {{ modal_expl }}
    </div>
    <template v-if="$slots.hasOwnProperty('content')">
      <slot name="content" />

      <div v-if="error">
        <p>{{ error }}</p>
      </div>
    </template>
    <template slot="footer">
      <button class="u-button" type="button" @click="$emit('close')">
        <b-icon icon="x-circle" />
        {{ $t("cancel") }}
      </button>
      <button
        class="u-button u-button_red"
        type="button"
        autofocus
        @click="removeFolder"
      >
        <b-icon icon="trash" />
        {{ $t("confirm_removal") }}
      </button>
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    path: String,
    modal_title: String,
    modal_expl: String,
    success_notification: String,
    show_modal_on_startup: Boolean,
  },
  components: {},
  data() {
    return {
      is_removing: false,
      error: null,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async removeFolder() {
      this.is_removing = true;
      this.error = null;

      try {
        const response = await this.$api.deleteItem({
          path: this.path,
        });
        this.response = response.data;

        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(
            this.success_notification || this.$t("removed_successfully")
          );

        this.$emit("removedSuccessfully");
      } catch (e) {
        this.error = e.response.data;
      }
      this.is_removing = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
