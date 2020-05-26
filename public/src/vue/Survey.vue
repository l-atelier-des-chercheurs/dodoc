<template>
  <div>
    <div class="m_topbar">
      <div
        class="m_topbar--left _survey_author_indicator"
        v-if="$root.current_author"
      >
        <button type="button" class="button-greenthin">
          {{ $root.current_author.name }}
          <span v-if="$root.current_author_is_admin">({{ $t("admin") }})</span>
        </button>
        <button
          type="button"
          class="buttonLink"
          v-if="user_replies.length > 0"
          :class="{ 'is--active': show_all_my_replies }"
          @click.stop="show_all_my_replies = !show_all_my_replies"
        >
          {{ $t("see_all_my_stories") }}
        </button>
        <button
          type="button"
          class="buttonLink"
          @click.stop="$root.unsetAuthor()"
        >
          {{ $t("logout") }}
        </button>
      </div>
      <div class="m_topbar--right">
        <div class="m_topbar--right--pictos">
          <button
            type="button"
            @click="showQRModal = !showQRModal"
            :content="$t('share_access')"
            v-tippy="{
              placement: 'bottom-end',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
              x="0px"
              y="0px"
              width="20px"
              height="20px"
              viewBox="0 0 90 90"
              style="enable-background: new 0 0 90 90;"
              xml:space="preserve"
            >
              <path
                d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"
              />
            </svg>
          </button>

          <QRCode
            v-if="showQRModal"
            :slugProjectName="slugProjectName"
            @close="showQRModal = false"
          />

          <a
            class="js--openInBrowser"
            target="_blank"
            href="https://latelier-des-chercheurs.fr/docs/manuel-dodoc"
            :content="$t('help')"
            v-tippy="{
              placement: 'bottom',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
              x="0px"
              y="0px"
              width="12px"
              height="20.3px"
              viewBox="0 0 12 20.3"
              style="enable-background: new 0 0 12 20.3;"
              xml:space="preserve"
            >
              <path
                class="st0"
                d="M9.4,0.6c0.9,0.4,1.5,1,2,1.7C11.8,3,12,3.7,12,4.6c0,0.8-0.1,1.4-0.4,1.9s-0.6,1-1,1.3
              c-0.4,0.3-0.9,0.7-1.5,1.1c-0.8,0.5-1.3,1-1.7,1.4C7.1,10.8,7,11.3,7,12v1H3.6v-1.1c0-0.8,0.1-1.6,0.4-2.2c0.3-0.6,0.6-1.1,1-1.4
              C5.4,8,5.8,7.6,6.4,7.2c0.6-0.4,1.1-0.8,1.4-1.1c0.3-0.3,0.4-0.7,0.4-1.2c0-0.6-0.2-1.1-0.6-1.4C7.2,3,6.6,2.9,5.9,2.9
              c-1.3,0-2.5,0.6-3.6,1.9L0,2.9C1.6,1,3.7,0,6.2,0C7.5,0,8.5,0.2,9.4,0.6z M7,16.4c0.5,0.4,0.7,1,0.7,1.6c0,0.6-0.2,1.2-0.7,1.6
              c-0.5,0.5-1,0.7-1.6,0.7c-0.6,0-1.1-0.2-1.6-0.7c-0.4-0.5-0.7-1-0.7-1.6c0-0.6,0.2-1.2,0.6-1.6c0.4-0.4,1-0.7,1.6-0.7
              S6.5,16,7,16.4z"
              />
            </svg>
          </a>

          <button
            type="button"
            @click="showSettingsModal = !showSettingsModal"
            :content="$t('settings')"
            v-tippy="{
              placement: 'bottom-end',
              delay: [600, 0],
            }"
          >
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="90px"
              height="90px"
              viewBox="0 0 90 90"
              style="enable-background: new 0 0 90 90;"
              xml:space="preserve"
            >
              <path
                class="st0"
                d="M79.8,49.3v-9c0-1,0.6-1.9,1.4-2.3l8.7-4.5l-1.8-5.2l-9.9,1.4c-1,0.2-2-0.3-2.6-1.1l-5.4-7.3
	c-0.6-0.8-0.7-1.8-0.2-2.7l4.3-8.6l-4.7-3.2l-6.9,6.8C62,14.3,61,14.5,60,14.2l-8.9-2.7c-1-0.3-1.7-1.1-1.9-2.2L47.5,0h-5.7
	l-1.6,9.4c-0.1,1-0.9,1.8-1.8,2.2l-8.9,2.8c-1,0.3-2,0.1-2.7-0.6l-7-6.6l-4.6,3.3l4.4,8.5c0.5,0.9,0.4,1.9-0.2,2.7L14,29
	c-0.6,0.8-1.6,1.2-2.6,1.1l-9.7-1.3L0,34l8.7,4.3c0.9,0.5,1.5,1.4,1.5,2.4v9c0,1-0.6,1.9-1.4,2.3l-8.6,4.5l1.8,5.3l9.8-1.4
	c1-0.1,2,0.3,2.6,1.1l5.4,7.3c0.6,0.8,0.7,1.8,0.2,2.7L15.7,80l4.6,3.2l6.9-6.8c0.7-0.7,1.8-0.9,2.7-0.6l8.9,2.7
	c1,0.3,1.7,1.1,1.9,2.1l1.7,9.4h5.7l1.6-9.4c0.1-1,0.9-1.8,1.8-2.2l8.9-2.8c1-0.3,2-0.1,2.7,0.6l7,6.6l4.6-3.3L70.4,71
	c-0.5-0.9-0.4-1.9,0.2-2.7L76,61c0.6-0.8,1.6-1.2,2.6-1.1l9.7,1.3L90,56l-8.7-4.3C80.4,51.2,79.8,50.3,79.8,49.3z M45,63.4
	c-10.5,0-19-8.3-19-18.4c0-10.2,8.5-18.4,19-18.4S64,34.8,64,45C64,55.2,55.5,63.4,45,63.4z"
              />
            </svg>
          </button>

          <SettingsModal
            v-if="showSettingsModal"
            @close="showSettingsModal = false"
          />
        </div>
      </div>

      <div class="m_topbar--status" v-if="!$root.state.connected">
        {{ $t("notifications.connection_lost") }}
        {{ $t("notifications.contents_wont_be_editable") }}
      </div>

      <div
        v-if="show_all_my_replies || !$root.current_publication"
        class="m_topbar--repliesList padding-small"
      >
        <label>{{ $t("list_of_stories") }}</label>
        <div
          v-for="reply in user_replies"
          :key="reply.slugFolderName"
          class="padding-verysmall"
        >
          <a :href="`/_publications/survey/${reply.slugFolderName}`">{{
            reply.name
          }}</a>
          <small>
            {{ $t("last_modified") }} —
            {{ $root.formatDateToPrecise(reply.date_modified) }}

            <template v-if="reply.date_submitted">
              •
              {{ $t("published") }} —
              {{ $root.formatDateToPrecise(reply.date_submitted) }}
            </template>
          </small>
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
import QRCode from "./components/modals/QRCode.vue";
import SettingsModal from "./components/modals/SettingsModal.vue";

export default {
  props: {},
  components: { Publication, QRCode, SettingsModal },
  data() {
    return {
      show_all_my_replies: false,
      showSettingsModal: false,
      showQRModal: false,
    };
  },
  created() {},
  mounted() {
    this.$socketio.listFolders({ type: "publications" });
    this.$root.updateNetworkInfos();
  },
  beforeDestroy() {},
  watch: {
    "$root.current_author": {
      handler() {
        this.surveyLoggedInAs(this.$root.current_author.slugFolderName);
      },
    },
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
          (a) => a.slugFolderName === this.$root.current_author.slugFolderName
        )
      );
    },
    user_replies() {
      return Object.values(this.$root.store.publications).filter(
        (p) =>
          !!p.follows_model &&
          p.authors &&
          p.authors.some(
            (a) => a.slugFolderName === this.$root.current_author.slugFolderName
          )
      );
    },
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
              authors: [{ slugFolderName: slugAuthorName }],
            },
          })
          .then(() => {});
      } else if (
        this.$root.current_publication.authors.some(
          (a) => a.slugFolderName === slugAuthorName
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
    },
  },
};
</script>
<style lang="scss" scoped></style>
