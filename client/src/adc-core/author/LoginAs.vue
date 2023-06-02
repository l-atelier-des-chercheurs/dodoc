<template>
  <div>
    <form v-if="!connected_as" @submit.prevent="login">
      <fieldset>
        <legend class="u-label">{{ $t("your_account") }}</legend>

        <div class="u-spacingBottom">
          <TextInput
            :content.sync="name_of_account"
            ref="nameField"
            :label_str="'name_or_pseudonym'"
            :required="true"
            :input_type="'text'"
            :autocomplete="'username'"
            @toggleValidity="($event) => (allow_save = $event)"
          />
          <template v-if="!name_matches_account && author_suggestions">
            <div class="_listOfAvatars">
              <AuthorTag
                v-for="atpath in author_suggestions"
                :key="atpath"
                :path="atpath"
                @click="suggestionClick(atpath)"
              />
            </div>
          </template>
        </div>

        <template v-if="name_matches_account">
          <div class="u-spacingBottom">
            <TextInput
              :label_str="$t('password')"
              ref="passwordField"
              :content.sync="input_password"
              :required="true"
              :input_type="'password'"
              :autocomplete="'current-password'"
              @toggleValidity="($event) => (allow_save = $event)"
            />
          </div>

          <div class="u-spacingBottom">
            <button
              type="button"
              class="u-buttonLink"
              :class="{
                'is--active': show_recover_instr,
              }"
              @click="show_recover_instr = !show_recover_instr"
            >
              {{ $t("recover_password") }}
            </button>
          </div>
          <div class="u-spacingBottom">
            <div class="u-instructions" v-if="show_recover_instr">
              {{ $t("please_contact_to_recover") }} <br />
              <a
                :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
                target="_blank"
              >
                {{ $root.app_infos.instance_meta.contactmail }}
              </a>
            </div>
          </div>
          <button type="submit" class="u-button u-button_bleuvert">
            {{ $t("login") }}
          </button>
        </template>
      </fieldset>
    </form>
  </div>
</template>
<script>
export default {
  props: {
    authors: Array,
  },
  components: {},
  data() {
    return {
      name_of_account: "",
      input_password: "",
      show_recover_instr: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    author_suggestions() {
      if (this.name_of_account.length === 0 || this.authors.length === 0)
        return false;

      const matching = this.authors.filter((a) =>
        a.name.toLowerCase().startsWith(this.name_of_account.toLowerCase())
      );
      if (matching.length > 3) return false;
      return matching.map((m) => m.$path);
    },
    name_matches_account() {
      return this.authors.find((a) => a.name === this.name_of_account);
    },
  },
  methods: {
    async login() {
      const author = this.name_matches_account;
      if (!author) {
        this.$refs.nameField.$el.querySelector("input").select();
        this.$alertify.delay(4000).error(this.$t("account_doesnt_exist"));
        return;
      }
      const path = author.$path;

      // closing too soon but forced to do this since line 88 is not working as intended…
      // this.$emit("close");

      this.$api
        .loginToFolder({
          path,
          auth_infos: {
            $password: this.input_password,
          },
        })
        .then(() => {
          this.$alertify.delay(4000).success(this.$t("logged_in"));

          this.$emit("close");
        })
        .catch((err) => {
          if (err === "submitted_password_is_wrong") {
            this.$refs.passwordField.$el.querySelector("input").select();
            this.$alertify
              .delay(40000)
              .error(this.$t("submitted_password_is_wrong"));
          }
          return;
        });
    },
    suggestionClick(path) {
      const a = this.authors.find((a) => a.$path === path);
      this.name_of_account = a.name;
    },
  },
};
</script>
<style lang="scss" scoped>
._authorSuggestion {
  cursor: pointer;
}

._listOfAvatars {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 4) 0;
}
</style>
