<template>
  <div>
    <div class="_survey_author_indicator" v-if="$root.current_author">
      <button type="button" class="button-greenthin">
        {{ $root.current_author.name }}
        <span
          v-if="$root.current_author_is_admin"
        >({{ $t("admin") }})</span>
      </button>
      <button
        type="button"
        class="buttonLink"
        v-if="user_replies.length > 0"
        :class="{ 'is--active': show_all_my_replies }"
        @click.stop="show_all_my_replies = !show_all_my_replies"
      >{{ $t("see_all_my_stories") }}</button>
      <button type="button" class="buttonLink" @click.stop="$root.unsetAuthor()">{{ $t("logout") }}</button>

      <div v-if="show_all_my_replies || !this.$root.current_publication" class="padding-small">
        <label>{{ $t("list_of_stories") }}</label>
        <div v-for="reply in user_replies" :key="reply.slugFolderName" class="padding-verysmall">
          <a :href="`/_publications/survey/${reply.slugFolderName}`">{{ reply.name }}</a>
        </div>
      </div>
    </div>

    <Publication
      v-if="$root.current_publication && survey_can_edit_publication"
      :publication="$root.current_publication"
      :read_only="!$root.state.connected"
    />
  </div>
</template>
<script>
import Publication from "./Publication.vue";

export default {
  props: {},
  components: { Publication },
  data() {
    return {
      show_all_my_replies: false
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "publications" });
  },
  beforeDestroy() {},
  watch: {
    "$root.current_author": {
      handler() {
        this.surveyLoggedInAs(this.$root.current_author.slugFolderName);
      }
    }
  },
  computed: {
    survey_can_edit_publication() {
      if (
        !this.$root.current_publication ||
        !this.$root.current_publication.authors ||
        !Array.isArray(this.$root.current_publication.authors) ||
        this.$root.current_publication.authors.length === 0
      )
        return false;
      if (this.$root.current_author_is_admin) return true;
      return (
        this.$root.current_author &&
        Array.isArray(this.$root.current_publication.authors) &&
        this.$root.current_publication.authors.some(
          a => a.slugFolderName === this.$root.current_author.slugFolderName
        )
      );
    },
    user_replies() {
      return Object.values(this.$root.store.publications).filter(
        p =>
          !!p.follows_model &&
          p.authors &&
          p.authors.some(
            a => a.slugFolderName === this.$root.current_author.slugFolderName
          )
      );
    }
  },
  methods: {
    surveyLoggedInAs(slugAuthorName) {
      if (this.$root.store.request.display !== "survey") return false;
      if (!this.$root.current_publication) return false;

      if (this.$root.current_publication.editing_limited_to === "everybody") {
        this.$root
          .editFolder({
            type: "publications",
            slugFolderName: this.$root.current_publication.slugFolderName,
            data: {
              editing_limited_to: "only_authors",
              viewing_limited_to: "",
              name: `[${this.$root.current_author.name}] ${this.$root.current_publication.name}`,
              authors: [{ slugFolderName: slugAuthorName }]
            }
          })
          .then(() => {});
      } else if (
        this.$root.current_publication.authors.some(
          a => a.slugFolderName === slugAuthorName
        ) ||
        this.$root.current_author_is_admin
      ) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .success(
            this.$t("notifications.connected_as") +
              "<i>" +
              this.$root.current_author.name +
              "</i>"
          );
      } else {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(
            this.$t("notifications.account_not_associated_to_this_ressource")
          );
      }
    }
  }
};
</script>
<style lang="scss" scoped></style>
