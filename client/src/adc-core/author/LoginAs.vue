<template>
  <div>
    <form v-if="!connected_as" @submit.prevent="login">
      <fieldset>
        <legend class="u-label">{{ $t("your_account") }}</legend>

        <transition name="pagechange" mode="out-in">
          <div v-if="!author_to_login_to" key="search">
            <transition name="pagechange" mode="out-in">
              <div v-if="!author_suggestions" class="" key="none" />
              <div
                v-else-if="author_suggestions.length === 0"
                class="u-instructions u-spacingBottom _noAuthorNotice"
                key="no_author"
              >
                <b-icon icon="exclamation-triangle-fill" />
                {{ $t("login_no_account_matches") }}
              </div>
              <div
                class="u-spacingBottom u-listOfAvatars"
                key="list"
                v-else-if="author_suggestions.length > 0"
              >
                <AuthorTag
                  v-for="atpath in author_suggestions"
                  :key="atpath"
                  :path="atpath"
                  :mode="'select'"
                  @click="checkAuthor(atpath)"
                />
              </div>
            </transition>
            <TextInput
              :content.sync="search_author_name"
              ref="nameField"
              :label_str="'name_or_pseudonym'"
              :required="true"
              :autofocus="true"
              :input_type="'text'"
              :autocomplete="'username'"
              @toggleValidity="($event) => (allow_save = $event)"
              @onEnter="setFirstSuggestion"
            />
            <!-- @onEnter="checkAuthor" -->
          </div>
          <div v-else key="login">
            <div class="u-spacingBottom _loginToAuthor">
              <button
                type="button"
                class="u-buttonLink"
                @click="author_to_login_to = undefined"
              >
                <b-icon icon="arrow-left-short" />
                {{ $t("back") }}
              </button>

              <div>
                <transition name="fade" mode="out-in">
                  <AuthorTag
                    :key="author_to_login_to.$path"
                    :path="author_to_login_to.$path"
                  />
                </transition>
              </div>

              <input
                style="display: none"
                id="name_or_pseudonym"
                type="text"
                :value="author_to_login_to.name"
              />
            </div>

            <div class="u-spacingBottom">
              <TextInput
                :label_str="'password'"
                ref="passwordField"
                :content.sync="input_password"
                :required="true"
                :autofocus="true"
                :input_type="'password'"
                :autocomplete="'current-password'"
                @toggleValidity="($event) => (allow_save = $event)"
                @onEnter="login"
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

            <transition name="fade" mode="out-in">
              <div
                class="u-spacingBottom u-warning"
                key="wrong_password"
                v-if="msg_password_is_wrong"
              >
                {{ msg_password_is_wrong || "test" }}
              </div>
              <div key="login_button" v-else class="_loginAs_button">
                <button type="submit" class="u-button u-button_bleuvert">
                  {{ $t("login") }}
                </button>
              </div>
            </transition>
          </div>
        </transition>
      </fieldset>

      <LoaderSpinner v-if="connection_status === 'pending'" />
      <div class="" v-else-if="connection_status === 'success'">
        {{ $t("logged_in") }}
      </div>
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
      search_author_name: "",
      author_to_login_to: undefined,

      input_password: "",
      show_recover_instr: false,
      connection_status: undefined,

      msg_password_is_wrong: undefined,
    };
  },
  created() {},
  mounted() {
    this.$eventHub.$on("login.suggest", this.checkAuthor);
  },
  beforeDestroy() {
    this.$eventHub.$off("login.suggest", this.checkAuthor);
  },
  watch: {
    connected_as() {
      // if (this.connected_as) this.$emit("close");
    },
  },
  computed: {
    author_suggestions() {
      if (this.search_author_name.length === 0 || this.authors.length === 0)
        return false;
      const matching = this.authors.filter((a) => {
        return this.twoStringsSearch(a.name, this.search_author_name);
      });
      return matching.map((m) => m.$path).slice(0, 5);
    },
  },
  methods: {
    setFirstSuggestion() {
      if (this.author_suggestions.length > 0)
        this.checkAuthor(this.author_suggestions.at(0));
    },
    async login() {
      this.connection_status = "pending";

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
          password: this.input_password,
        })
        .then(() => {
          // this.$alertify
          //   .delay(4000)
          //   .success(this.$t("logged_in"));
          this.connection_status = "success";
          window.location.reload();
        })
        .catch((err) => {
          this.connection_status = "failed";
          if (err.code === "submitted_password_is_wrong") {
            this.$refs.passwordField.$el.querySelector("input").select();
            this.msg_password_is_wrong = this.$t("submitted_password_is_wrong");

            setTimeout(() => {
              this.msg_password_is_wrong = undefined;
            }, 3500);
          }
          return;
        });
    },
    checkAuthor(path) {
      const a = this.authors.find((a) => a.$path === path);
      this.search_author_name = "";
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

._loginAs_button {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
}
</style>
