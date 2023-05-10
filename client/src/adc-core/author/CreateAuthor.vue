<template>
  <div class="_createAuthor">
    <transition name="fade_fast" mode="out-in">
      <LoaderSpinner v-if="is_submitting_signup_password" />
      <form
        v-else-if="!can_create_author"
        class="input-validation-required"
        @submit.prevent="submitSignupPassword"
      >
        <TextInput
          :label_str="'signup_password'"
          ref="passwordField"
          :content.sync="submitted_signup_password"
          :required="true"
          :autocomplete="'off'"
          :input_type="'password'"
        />
        <div>
          <small
            class="u-instructions"
            v-html="$t('please_contact_to_recover')"
          />
        </div>

        <button slot="footer" class="u-button u-button_bleuvert" type="submit">
          {{ $t("submit") }}
        </button>
      </form>
      <form
        v-else
        class="input-validation-required"
        @submit.prevent="createAuthor"
      >
        <fieldset>
          <legend class="u-label">{{ $t("new_account") }}</legend>

          <!-- <ImageSelect
          :folder_path="'/authors'"
          @newPreview="
            (value) => {
              new_author_cover_raw = value;
            }
          "
        /> -->

          <TextInput
            :content.sync="new_author_name"
            :label_str="'name_or_pseudonym'"
            :required="true"
            :maxlength="40"
            :autocomplete="'username'"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <br />

          <TextInput
            :content.sync="new_author_email"
            :label_str="'email'"
            :required="$root.app_infos.instance_meta.require_mail_to_signup"
            :input_type="'email'"
            :autocomplete="'email'"
            :instructions="$t('email_instr')"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <br />

          <TextInput
            :content.sync="new_author_password"
            :label_str="$t('password')"
            :minlength="3"
            :maxlength="20"
            :required="true"
            :input_type="'password'"
            :autocomplete="'new-password'"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <br />

          <button
            slot="footer"
            :loading="is_creating_author"
            class="u-button u-button_bleuvert"
            type="submit"
          >
            {{ $t("create") }}
          </button>
        </fieldset>

        <template v-if="error_msg">
          <div class="u-errorMsg" v-text="error_msg" />
        </template>
      </form>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    is_first_user: Boolean,
  },
  components: {},
  data() {
    return {
      new_author_email: "",
      new_author_name: "",
      new_author_password: "",
      new_author_cover_raw: undefined,

      is_creating_author: false,
      error_msg: "",

      can_create_author: false,
      submitted_signup_password: "",
      is_submitting_signup_password: false,
    };
  },
  created() {
    if (!this.has_signup_password) this.can_create_author = true;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    signup_password() {
      return this.$root.app_infos.instance_meta.signup_password_hashed;
    },
    has_signup_password() {
      return !!this.signup_password;
    },
  },
  methods: {
    async createAuthor() {
      this.is_creating_author = true;

      try {
        // check existing used author

        const author_slug = await this.$api.createFolder({
          path: "/authors",
          additional_meta: {
            email: this.new_author_email,
            name: this.new_author_name,
            requested_slug: this.new_author_name,
            $status: "public",
            $password: this.new_author_password,
          },
        });
        this.new_author_name = "";
        await this.$api.loginToFolder({
          path: "authors/" + author_slug,
          auth_infos: {
            $password: this.new_author_password,
          },
        });
        this.$emit("close");
      } catch (err) {
        if (err.code === "unique_field_taken") {
          this.$alertify.delay(4000).error(this.$t("notifications.name_taken"));
          this.$refs.titleInput.$el.querySelector("input").select();
        }
        this.is_creating_space = false;
      }
      this.is_creating_author = false;
    },
    async submitSignupPassword() {
      this.is_submitting_signup_password = true;

      await new Promise((r) => setTimeout(r, 500));

      const hashed_submitted_pw = this.hashCode(this.submitted_signup_password);
      if (hashed_submitted_pw === this.signup_password)
        this.can_create_author = true;
      else
        this.$alertify.delay(4000).error("notifications.wrong_signup_password");

      this.is_submitting_signup_password = false;
    },

    hashCode(s) {
      return (
        "" +
        s.split("").reduce(function (a, b) {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._createAuthor {
  position: relative;
  min-height: 50px;
  // border: 2px solid var(--c-gris);
  // padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);
  // margin: calc(var(--spacing) / 2) 0;
  // border-radius: 4px;
}
</style>
