<template>
  <div>
    <form v-if="!connected_as" @submit.prevent="login">
      <fieldset>
        <legend class="u-label">{{ $t("your_account") }}</legend>
        <TextInput
          :content.sync="name_of_account"
          ref="nameField"
          :label_str="'name_or_pseudonym'"
          :required="true"
          :input_type="'text'"
          :autocomplete="'username'"
          @toggleValidity="($event) => (allow_save = $event)"
        />
        <br />

        <TextInput
          :label_str="$t('password')"
          ref="passwordField"
          :content.sync="input_password"
          :required="true"
          :input_type="'password'"
          :autocomplete="'current-password'"
          @toggleValidity="($event) => (allow_save = $event)"
        />

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

        <div class="u-instructions" v-if="show_recover_instr">
          {{ $t("please_contact_to_recover") }} <br />
          <a
            :href="'mailto:' + $root.app_infos.instance_meta.contactmail"
            target="_blank"
          >
            {{ $root.app_infos.instance_meta.contactmail }}
          </a>
        </div>

        <br />
        <br />

        <button type="submit" class="u-button u-button_bleuvert">
          {{ $t("login") }}
        </button>
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
  computed: {},
  methods: {
    async login() {
      const author = this.authors.find((a) => a.name === this.name_of_account);
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
  },
};
</script>
<style lang="scss" scoped></style>
