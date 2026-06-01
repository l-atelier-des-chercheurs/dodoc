<template>
  <BaseModal2
    :title="$t('contributors')"
    :is_closable="is_closable"
    @close="$emit('close')"
  >
    <div>
      <!-- <div class="u-wips" /> -->

      <template v-if="!connected_as || is_instance_admin">
        <RadioSwitch
          :content.sync="current_mode"
          :options="[
            {
              label: $t('login'),
              value: 'login',
            },
            {
              label: $t('create_account'),
              value: 'create',
            },
          ]"
        />

        <br />

        <LoginAs
          v-if="current_mode === 'login'"
          :authors="sorted_authors"
          @close="$emit('close')"
        />
        <CreateAuthor
          v-else-if="current_mode === 'create'"
          :is_first_user="!authors || authors.length === 0"
          @close="$emit('close')"
        />
      </template>

      <fieldset v-if="connected_as && current_mode === 'login'">
        <legend>{{ $t("your_account") }}</legend>

        <AuthorCard
          :key="connected_as.$path"
          :author="connected_as"
          class="u-spacingBottom"
          @navToPage="$emit('close')"
        />
        <button type="button" class="u-button u-button_red" @click="logout">
          {{ $t("logout") }}
        </button>
      </fieldset>

      <template v-if="current_mode === 'login'">
        <br />

        <small v-if="authors.length === 0">
          {{ $t("no_accounts_yet") }}
        </small>

        <router-link
          :to="'/@'"
          @click.native="$emit('close')"
          class="u-buttonLink"
        >
          <b-icon icon="person-circle" />
          {{ $t("show_all_accounts") }}
        </router-link>
      </template>

      <BaseModal2 v-if="is_logging_out" :size="'small'">
        <div class="u-instructions" style="text-align: center">
          {{ $t("logging_out") }}
        </div>
      </BaseModal2>
    </div>
  </BaseModal2>
</template>
<script>
import CreateAuthor from "@/adc-core/author/CreateAuthor.vue";
import AuthorCard from "@/adc-core/author/AuthorCard.vue";
import LoginAs from "@/adc-core/author/LoginAs.vue";

export default {
  props: {
    is_closable: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    CreateAuthor,
    AuthorCard,
    LoginAs,
  },
  data() {
    return {
      current_mode: "login",
      show_authors_list: false,
      authors: [],
      path: "authors",
      is_logging_out: false,
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: this.path,
    });
    // if no authors, then switch to register
    if (this.authors.length === 0) this.current_mode = "create";
  },
  beforeDestroy() {},
  watch: {
    $route() {
      // if navigating to another route, lets close modal
      // this.$emit("close");
      // problematic for luma doc
    },
  },
  computed: {
    sorted_authors() {
      return this.authors.slice().sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
    },
  },
  methods: {
    suggestLogin(path) {
      this.$eventHub.$emit("login.suggest", path);
    },
    async logout() {
      try {
        this.is_logging_out = true;
        this.reponse = await this.$api.logoutFromFolder();
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err) {
        this.is_logging_out = false;
        this.response = err;
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
