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
          <small class="u-instructions">
            {{ $t("signup_password_users_instructions") }}
            <br />
            <a
              :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
              target="_blank"
            >
              {{ $root.app_infos.instance_meta.contactmail }}
            </a>
          </small>
        </div>

        <br />

        <button slot="footer" class="u-button u-button_bleuvert" type="submit">
          {{ $t("submit") }}
        </button>
      </form>
      <form
        v-else-if="!account_created_notice"
        class="input-validation-required"
        @submit.prevent="createAuthor"
      >
        <fieldset>
          <legend class="u-label">{{ $t("new_account") }}</legend>

          <TextInput
            :content.sync="new_author_name"
            :label_str="'name_or_pseudonym'"
            :required="true"
            :autofocus="true"
            :maxlength="40"
            :autocomplete="'username'"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <div class="u-spacingBottom" />

          <TextInput
            :content.sync="new_author_email"
            :label_str="'email'"
            :required="$root.app_infos.instance_meta.require_mail_to_signup"
            :input_type="'email'"
            :autocomplete="'email'"
            :instructions="$t('email_instr')"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <div class="u-spacingBottom" />

          <div class="">
            <DLabel :str="$t('pick_portrait')" />
            <div>
              <img
                class="_imgPreview"
                v-if="new_cover_object_url"
                :src="new_cover_object_url"
              />
              <EditBtn
                :label="!new_cover ? $t('add') : undefined"
                :is_unfolded="true"
                @click="select_image = true"
              />
              <ImageSelect
                v-if="select_image"
                :label="$t('pick_portrait')"
                :ratio="'square'"
                :preview_format="'circle'"
                :available_options="['import', 'capture']"
                @close="select_image = false"
                @newPreview="
                  (value) => {
                    new_cover = value;
                    select_image = false;
                  }
                "
              />
            </div>
          </div>

          <div class="u-spacingBottom" />

          <TextInput
            :content.sync="new_author_password"
            :label_str="'password'"
            :minlength="3"
            :maxlength="20"
            :required="true"
            :input_type="'password'"
            :autocomplete="'new-password'"
            @toggleValidity="($event) => (allow_save = $event)"
          />

          <div class="u-spacingBottom" />

          <template
            v-if="
              $root.app_infos.instance_meta.users_must_accept_terms_to_signup
            "
          >
            <ToggleInput
              :content.sync="terms_accepted"
              :label="$t('i_read_and_accept_terms')"
            />

            <div class="u-instructions">
              <router-link
                :to="createURLFromPath('pages/terms')"
                class="u-buttonLink"
              >
                {{ $t("click_here_to_read") }}
              </router-link>
            </div>

            <div class="u-spacingBottom" />
          </template>

          <div slot="footer">
            <div />
            <button
              :loading="is_creating_author"
              :disabled="
                $root.app_infos.instance_meta
                  .users_must_accept_terms_to_signup === true &&
                terms_accepted === false
              "
              class="u-button u-button_bleuvert"
              type="submit"
            >
              {{ $t("create") }}
            </button>
          </div>
        </fieldset>
      </form>
      <div v-else-if="account_created_notice" class="u-successMsg">
        {{ $t("account_created") }}
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    is_first_user: Boolean,
  },
  components: {
    ImageSelect: () => import("@/adc-core/fields/ImageSelect.vue"),
  },
  data() {
    return {
      new_author_email: "",
      new_author_name: "",
      new_author_password: "",
      new_author_cover_raw: undefined,

      select_image: false,

      is_creating_author: false,
      error_msg: "",

      can_create_author: false,
      submitted_signup_password: "",
      is_submitting_signup_password: false,

      account_created_notice: false,

      new_cover: undefined,
      terms_accepted: false,
    };
  },
  created() {
    if (!this.has_signup_password) this.can_create_author = true;
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    connected_as() {
      if (this.connected_as) this.$emit("close");
    },
  },
  computed: {
    signup_password() {
      return this.$root.app_infos.instance_meta.signup_password_hashed;
    },
    has_signup_password() {
      return !!this.signup_password;
    },
    new_cover_object_url() {
      if (!this.new_cover) return undefined;
      return URL.createObjectURL(this.new_cover);
    },
  },
  methods: {
    async createAuthor() {
      this.is_creating_author = true;

      try {
        // check existing used author

        const author_slug = await this.$api.createFolder({
          path: "authors",
          additional_meta: {
            email: this.new_author_email,
            name: this.new_author_name,
            requested_slug: this.new_author_name,
            $status: "public",
            $password: this.new_author_password,
          },
        });

        this.$alertify.delay(4000).success(this.$t("account_created"));

        this.new_author_name = "";

        // only login if not yet connected
        if (!this.connected_as) {
          await this.$api.loginToFolder({
            path: "authors/" + author_slug,
            password: this.new_author_password,
          });
        } else {
          // otherwise we are instance admins
          this.account_created_notice = true;
          setTimeout(() => {
            this.account_created_notice = false;
          }, 3000);
        }

        const author_page = `authors/${author_slug}`;
        if (this.new_cover) {
          await this.$api.updateCover({
            path: author_page,
            new_cover_data: this.new_cover,
            // onProgress,
          });
        }

        if (!this.is_instance_admin) {
          window.location.reload();
        }

        // not working
        // this.$emit("close");
      } catch (err) {
        if (err.code === "unique_field_taken") {
          this.$alertify
            .delay(4000)
            .error(this.$t("name_taken") + " : " + err.err_infos);
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
      else this.$alertify.delay(4000).error("wrong_signup_password");

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

._imgPreview {
  width: 100%;
  max-width: 140px;
  border: 2px solid var(--c-gris);
  aspect-ratio: 1;
  border-radius: 50%;
  overflow: hidden;
  object-fit: cover;
  object-position: center;
}
</style>
