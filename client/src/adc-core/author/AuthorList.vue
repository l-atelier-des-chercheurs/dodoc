<template>
  <BaseModal2 :title="$t('authors')" @close="$emit('close')">
    <div>
      <div class="u-wips" />

      <CreateAuthor />

      <div v-for="author in authors" :key="author.$path">
        {{ author.name }} <br />
        <small>{{ author }}</small>
        <button type="button" @click="removeAuthor(author.$path)">x</button>
        <br /><br />
      </div>

      <div class="_topLabel">
        <label for="" class="u-label">{{ $t("slug") }}</label>
      </div>
      <input type="text" v-model="login_to_slug" />
      <button
        type="button"
        :disabled="login_to_slug.length === 0"
        @click="loginAs"
      >
        login
      </button>

      response = {{ response }}

      <button type="button" @click="$emit('close')">fermer</button>
    </div>
  </BaseModal2>
</template>
<script>
import CreateAuthor from "@/adc-core/author/CreateAuthor.vue";

export default {
  props: {},
  components: {
    CreateAuthor,
  },
  data() {
    return {
      authors: [],
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
  },
};
</script>
<style lang="scss" scoped></style>
