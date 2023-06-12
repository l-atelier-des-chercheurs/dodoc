<template>
  <div>
    <form v-if="!connected_as" @submit.prevent="login">
      <fieldset>
        <legend class="u-label">{{ $t("your_account") }}</legend>

        <transition name="pagechange" mode="out-in">
          <div v-if="!author_to_login_to" key="search">
            <TextInput
              :content.sync="search_for_author"
              ref="nameField"
              :label_str="'name_or_pseudonym'"
              :required="true"
              :input_type="'text'"
              :autocomplete="'username'"
              @toggleValidity="($event) => (allow_save = $event)"
            />
            <!-- @onEnter="checkAuthor" -->
            <transition name="pagechange" mode="out-in">
              <div v-if="!author_suggestions" key="none" />
              <div
                v-else-if="author_suggestions.length === 0"
                class="u-instructions _noAuthorNotice"
                key="no_author"
              >
                <sl-icon name="exclamation-triangle-fill" />
                {{ $t("login_no_author_matches") }}
              </div>
              <div
                class="u-listOfAvatars"
                key="list"
                v-else-if="author_suggestions.length > 0"
              >
                <AuthorTag
                  v-for="atpath in author_suggestions"
                  :key="atpath"
                  :path="atpath"
                  @click="checkAuthor(atpath)"
                />
              </div>
            </transition>
          </div>
          <div v-else key="login">
            <div class="u-spacingBottom _loginToAuthor">
              <button
                type="button"
                class="u-buttonLink"
                @click="author_to_login_to = undefined"
              >
                <sl-icon name="arrow-left-short" />
                {{ $t("back") }}
              </button>
              <AuthorTag :path="author_to_login_to.$path" />
            </div>

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
          </div>
        </transition>
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
      search_for_author: "",
      author_to_login_to: undefined,

      input_password: "",
      show_recover_instr: false,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("login.suggest", this.checkAuthor);
  },
  beforeDestroy() {
    this.$eventHub.$off("login.suggest", this.checkAuthor);
  },
  watch: {},
  computed: {
    author_suggestions() {
      if (this.search_for_author.length === 0 || this.authors.length === 0)
        return false;

      const matching = this.authors.filter((a) => {
        const name = a.name.toLowerCase();
        const slug = `@${this.getFilename(a.$path)}`;
        return (
          name.startsWith(this.search_for_author.toLowerCase()) ||
          slug.startsWith(this.search_for_author.toLowerCase())
        );
      });

      return matching.map((m) => m.$path);
    },
  },
  methods: {
    async login() {
      const author = this.author_to_login_to;
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
    checkAuthor(path) {
      const a = this.authors.find((a) => a.$path === path);
      this.search_for_author = "";
      this.author_to_login_to = a;
    },
  },
};
</script>
<style lang="scss" scoped>
._authorSuggestion {
  cursor: pointer;
}

._noAuthorNotice {
  padding: calc(var(--spacing) / 4) 0;
}
</style>
