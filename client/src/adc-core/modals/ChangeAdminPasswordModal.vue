<template>
  <BaseModal2 :title="$t('admin_welcome_change_password')" @close="$emit('close')">
    <p class="u-spacingBottom">
      {{ $t("admin_password_modal_text") }}
    </p>

    <form @submit.prevent="save">
      <TextInput
        :content.sync="new_password"
        :label_str="'password'"
        :minlength="3"
        :maxlength="20"
        :required="true"
        :input_type="'password'"
        :autocomplete="'new-password'"
        @toggleValidity="($event) => (is_valid = $event)"
        @onEnter="save"
      />
      <p v-if="is_default_password" class="u-warning">
        {{ $t("admin_password_must_differ") }}
      </p>
    </form>

    <template slot="footer">
      <SaveCancelButtons
        :is_saving="is_saving"
        :allow_save="can_save"
        @save="save"
        @cancel="$emit('close')"
      />
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    // path of the account whose password is changed
    author_path: {
      type: String,
      default: "authors/admin",
    },
    default_password: {
      type: String,
      default: "dodoc",
    },
  },
  data() {
    return {
      new_password: "",
      is_valid: false,
      is_saving: false,
    };
  },
  computed: {
    is_default_password() {
      return this.new_password === this.default_password;
    },
    can_save() {
      return this.is_valid && !this.is_default_password;
    },
  },
  methods: {
    async save() {
      if (!this.can_save || this.is_saving) return;
      this.is_saving = true;
      try {
        await this.$api.updateMeta({
          path: this.author_path,
          new_meta: { $password: this.new_password },
        });
        this.$alertify.delay(4000).success(this.$t("admin_password_changed"));
        this.$emit("changed");
        this.$emit("close");
      } catch (err) {
        this.$alertify.delay(4000).error(err?.code || err);
      } finally {
        this.is_saving = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
