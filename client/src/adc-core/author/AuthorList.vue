<template>
  <BaseModal2 :title="$t('authors')" @close="$emit('close')">
    <div>
      <div class="u-wips" />

      <template v-if="!$api.is_identified">
        <div class="_topLabel">
          <label for="" class="u-label">{{ $t("slug") }}</label>
        </div>
        <input type="text" v-model="login_to_slug" />
        <button
          type="button"
          class="u-button"
          :disabled="login_to_slug.length === 0"
          @click="loginAs"
        >
          login
        </button>
      </template>
      <button type="button" v-else @click="logout">logout</button>

      <button
        type="button"
        class="u-button"
        @click="show_create_author = !show_create_author"
      >
        {{ $t("create_author") }}
      </button>
      <CreateAuthor v-if="show_create_author" />

      <br /><br />

      <AuthorCard
        v-for="author in authors"
        :key="author.$path"
        :author="author"
      />

      <button type="button" @click="$emit('close')">fermer</button>
    </div>
  </BaseModal2>
</template>
<script>
import CreateAuthor from "@/adc-core/author/CreateAuthor.vue";
import AuthorCard from "@/adc-core/author/AuthorCard.vue";

export default {
  props: {},
  components: {
    CreateAuthor,
    AuthorCard,
  },
  data() {
    return {
      authors: [],
      show_create_author: false,
      login_to_slug: "",
      response: "",
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: `authors`,
    });
    this.$api.join({ room: "authors" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async removeAuthor(path) {
      await this.$api.deleteItem({
        path,
      });
    },
    async loginAs() {
      this.response = "";

      try {
        this.response = await this.$api.loginToFolder({
          path: "authors/" + this.login_to_slug,
          auth_infos: {
            $password: "123",
          },
        });
      } catch (err) {
        this.response = err;
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
    async logout() {
      try {
        this.reponse = await this.$api.logoutFromFolder();
      } catch (err) {
        this.response = err;
        this.$alertify.delay(4000).error(err);
        return false;
      }
    },
  },
};
</script>
<style lang="scss" scoped></style>
