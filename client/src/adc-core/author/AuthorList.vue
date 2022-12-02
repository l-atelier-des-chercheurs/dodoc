<template>
  <BaseModal2 :title="$t('contributors')" @close="$emit('close')">
    <div>
      <!-- <div class="u-wips" /> -->

      <RadioSwitch
        v-if="!is_identified"
        :label_left="$t('login')"
        @clickLeft="current_mode = 'login'"
        :label_right="$t('create_account')"
        @clickRight="current_mode = 'create'"
      />

      <br />

      <LoginAs v-if="current_mode === 'login'" :authors="authors" />
      <CreateAuthor
        v-else-if="current_mode === 'create'"
        @close="$emit('close')"
      />

      <br />
      <hr />
      <br />
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
      <div class="_listOfAuthors" v-if="show_authors_list">
        <AuthorCard
          v-for="author in authors"
          :key="author.$path"
          :author="author"
        />
      </div>
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
      show_authors_list: false,
      authors: [],
    };
  },
  created() {},
  async mounted() {
    this.authors = await this.$api.getFolders({
      path: `authors`,
    });
    this.$api.join({ room: "authors" });
  },
  beforeDestroy() {
    this.$api.leave({ room: "authors" });
  },
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._listOfAuthors {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 4);
  margin: calc(var(--spacing) / 4) 0;
}
</style>
