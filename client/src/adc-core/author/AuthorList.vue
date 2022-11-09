<template>
  <BaseModal2 :title="$t('authors')" @close="$emit('close')">
    <div>
      <div class="u-wips" />

      <NewAuthor />

      <div v-for="author in authors" :key="author.$slug">
        {{ author.name }} <br />
        <small>{{ author }}</small>
        <button type="button" @click="removeAuthor(author.$slug)">x</button>
        <br /><br />
      </div>

      <input type="text" v-model="login_to_slug" />
      <button type="button" @click="loginAs">login</button>

      <button type="button" @click="$emit('close')">fermer</button>
      <button type="button" @click="$emit('close')">fermer</button>
    </div>
  </BaseModal2>
</template>
<script>
import NewAuthor from "@/adc-core/author/NewAuthor.vue";

export default {
  props: {},
  components: {
    NewAuthor,
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
      folder_type: "authors",
    });
    this.$api.join({ room: "authors" });
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    async removeAuthor(slug) {
      await this.$api.deleteFolder({
        folder_type: "authors",
        folder_slug: slug,
      });
    },
    async loginAs() {
      this.response = "";
      this.response = await this.$api
        .loginToFolder({
          folder_type: "authors",
          folder_slug: this.login_to_slug,
          auth_infos: {
            $password: "123",
          },
        })
        .catch((err) => {
          this.$alertify.delay(4000).error(err);
        });
    },
  },
};
</script>
<style lang="scss" scoped></style>
