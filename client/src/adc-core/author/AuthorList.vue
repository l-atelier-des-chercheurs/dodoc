<template>
  <BaseModal2 :title="$t('contributors')" @close="$emit('close')">
    <div>
      <!-- <div class="u-wips" /> -->

      <RadioSwitch
        :label_left="$t('login')"
        @clickLeft="current_mode = 'login'"
        :label_right="$t('create_account')"
        @clickRight="current_mode = 'create'"
      />

      <LoginAs v-if="current_mode === 'login'" :authors="authors" />
      <CreateAuthor v-else-if="current_mode === 'create'" />

      <template v-if="false">
        <hr />

        <div class="_topLabel">
          <label for="" class="u-label">{{ $t("list_of_contributors") }}</label>
        </div>

        <small v-if="authors.length === 0">
          {{ $t("no_accounts_yet") }}
        </small>
        <button
          type="button"
          v-else
          class="u-button"
          @click="show_authors_list = !show_authors_list"
        >
          {{ $t("show_all") }} ({{ authors.length }})
        </button>
        <template v-if="show_authors_list">
          <AuthorCard
            v-for="author in authors"
            :key="author.$path"
            :author="author"
          />
        </template>
      </template>
    </div>
  </BaseModal2>
</template>
<script>
import CreateAuthor from "@/adc-core/author/CreateAuthor.vue";
import AuthorCard from "@/adc-core/author/AuthorCard.vue";
import LoginAs from "@/adc-core/author/LoginAs.vue";

export default {
  props: {},
  components: {
    CreateAuthor,
    AuthorCard,
    LoginAs,
  },
  data() {
    return {
      current_mode: "login",
      authors: [],
      show_create_author: false,
      show_authors_list: false,
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
  methods: {},
};
</script>
<style lang="scss" scoped></style>
