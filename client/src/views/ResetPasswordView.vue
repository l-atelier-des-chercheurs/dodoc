<template>
  <div class="_resetPassword">
    <div class="_resetPassword--form">
      <h1 class="u-spacingBottom">Reset Password</h1>
      <div v-if="is_loading" class="loading-message">Loading...</div>
      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>
      <div v-else-if="submitSuccess" class="success-message">
        {{ submitSuccess }}
      </div>
      <form v-else @submit.prevent="handleSubmit">
        <div v-if="author" class="u-spacingBottom">
          <p class="u-instructions">
            {{ $t("set_new_password_for_account") }}
            <strong>{{ author.name }}</strong>
          </p>
        </div>
        <!-- <div class="form-group">
          <label for="password">New Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            minlength="8"
            class="form-control"
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="confirmPassword"
            required
            minlength="8"
            class="form-control"
          />
        </div> -->

        <TextInput
          :content.sync="reset_password"
          :label_str="'password'"
          :minlength="3"
          :maxlength="20"
          :required="true"
          :input_type="'password'"
          :autocomplete="'new-password'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

        <div v-if="submitError" class="error-message">
          {{ submitError }}
        </div>

        <div class="_bottomBtns">
          <button
            type="submit"
            class="u-button u-button_bleuvert"
            :disabled="!allow_save || is_submitting"
          >
            {{ is_submitting ? "Resetting..." : "Reset Password" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: "ResetPasswordView",
  data() {
    return {
      submitError: "",
      submitSuccess: "",
      is_submitting: false,
      author: null,

      is_loading: true,
      author_path: window.decodeURIComponent(this.$route.query.path),
      author: false,
      error: "",

      reset_password: "",
      allow_save: false,
    };
  },
  async created() {
    try {
      this.author = await this.$api
        .getFolder({
          path: this.author_path,
        })
        .catch((err) => {
          this.error = err.response;
        });
    } catch (err) {
    } finally {
      this.is_loading = false;
    }
  },
  methods: {
    async handleSubmit() {
      this.submitError = "";
      this.is_submitting = true;

      try {
        await this.$api.resetPassword({
          path: this.author_path,
          new_password: this.reset_password,
          token: this.$route.query.token,
        });

        this.submitSuccess = "Password reset successful";

        // this.$router.push("/login?message=Password reset successful");
      } catch (err) {
        this.submitError =
          err.response?.data?.message || "Failed to reset password";
      } finally {
        this.is_submitting = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._resetPassword {
  max-width: 420px;
  margin: 0 auto;
  padding: var(--spacing);
}

._bottomBtns {
  display: flex;
  justify-content: flex-end;
}
</style>
