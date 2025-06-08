<template>
  <div class="_topBar">
    <div class="_logoIcons">
      <router-link to="/" class="_logo">LumaDoc</router-link>

      <div class="_topRow">
        <div class="_separator" />
        <button
          type="button"
          class="u-button u-button_icon"
          @click="show_qr_code_modal = true"
        >
          <div part="base" class="icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-qr-code"
              viewBox="0 0 16 16"
            >
              <path d="M2 2h2v2H2V2Z"></path>
              <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"></path>
              <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"></path>
              <path
                d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"
              ></path>
              <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"></path>
            </svg>
          </div>
        </button>
        <QRModal
          v-if="show_qr_code_modal"
          :url_to_access="url_to_page"
          @close="show_qr_code_modal = false"
        />
        <button
          type="button"
          class="u-button u-button_icon"
          @click="$eventHub.$emit(`app.show_welcome_modal`)"
        >
          <b-icon icon="question-square" />
        </button>

        <button
          type="button"
          class="u-button u-button_icon"
          @click="show_lang_modal = !show_lang_modal"
        >
          {{ current_lang_code }}
        </button>
        <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />

        <button
          type="button"
          class="u-button u-button_icon"
          v-if="is_instance_admin"
          @click="show_admin_settings = !show_admin_settings"
        >
          <b-icon icon="gear" :aria-label="$t('admin_settings')" />
        </button>
        <AdminLumaSettings
          v-if="show_admin_settings"
          @close="show_admin_settings = false"
        />

        <!-- <button
          type="button"
          class="u-button u-button_icon _chatsBtn"
          :class="{
            'is--active': $root.show_chats_list,
          }"
          :title="$t('chats')"
          @click="$root.show_chats_list = !$root.show_chats_list"
        >
          <svg
            enable-background="new 0 0 168 168"
            height="168"
            viewBox="0 0 168 168"
            width="168"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m84 168c46.4 0 84-37.6 84-84s-37.6-84-84-84-84 37.6-84 84 37.6 84 84 84z"
              fill="#fc4b60"
            />
            <path
              d="m70.5 104.6c-13.4-13.6-18.6-35-9.8-52.6 8.2-16.4 25.2-27.6 43.9-26.4 19.4 1.3 37.3 14.7 42 34 4.8 19.8-3 39.3-19.9 50.7-2 1.4-2.5 3.6-1.5 5.8 1.3 2.6 2.6 5.3 3.9 7.9.8 1.7 1.6 3.3 2.4 5 .4.8 1.1 1.3.1 1-5-1.7-10-3.5-15.1-5.2-15.1-5.4-33.9-9.3-46-20.2z"
              fill="#fc4b60"
            />
            <path
              d="m66.7 109.3c14.6 13.3 37.8 17.9 56.2 24.3 5.4 1.9 15.2 6.2 17.3-2.3 1.2-5-3.3-12.3-6.3-17.7 16.7-13 25.7-34.7 19.6-55.7-6.1-20.8-24.3-37-46.3-38.5-21.7-1.4-44.1 10.7-52.3 31.5-8.1 20.5-3.8 42.7 11.8 58.4zm5.6-5.9c-13-13.1-18-33.7-9.4-50.7 7.9-15.8 24.3-26.6 42.3-25.4 18.7 1.2 35.9 14.2 40.5 32.7 4.7 19.1-2.9 37.9-19.1 48.8-2 1.3-2.4 3.5-1.4 5.6 1.2 2.6 2.5 5.1 3.7 7.7.8 1.6 1.6 3.2 2.3 4.8.4.8 1.1 1.3.1 1-4.8-1.7-9.7-3.4-14.5-5.1-14.7-5.1-32.8-8.8-44.5-19.4z"
              fill="#12224c"
            />
            <path
              d="m60.4 137.4c-4.8 2.4-9.6 4.9-14.4 7.3-.9.5-.3-.1 0-1 .6-1.8 1.2-3.6 1.8-5.4.9-2.8 1.9-5.7 2.8-8.5.8-2.3 0-4.5-2.3-5.6-18.5-9.1-29-27.7-26.8-48.2 2-20 18.2-35.9 37.5-39.8 18.7-3.8 37.2 5.2 47.7 20.5 11.3 16.5 9 38.7-2.7 54.2-10.6 12.6-29 19.1-43.6 26.5z"
              fill="#fc4b60"
            />
            <path
              d="m112.2 55.4c-10.9-19.5-34.7-28.5-56-24.2-21.7 4.4-37.5 22.9-40.8 44.4-3.3 21.6 8.6 42 26.9 52.6-2.3 5.7-5.8 13.5-3.9 18.3 3.2 8.2 12.3 2.6 17.4 0 17.4-8.8 39.8-16.5 52.5-31.6 13.3-17.6 14.6-40.2 3.9-59.5zm-51.8 79.7c-4.6 2.3-9.1 4.6-13.7 7-.9.5-.3-.1 0-1 .6-1.7 1.1-3.4 1.7-5.1.9-2.7 1.8-5.4 2.7-8.1.7-2.2 0-4.3-2.1-5.3-17.6-8.7-27.6-26.3-25.5-45.8 2-19 17.4-34.1 35.7-37.9 17.7-3.6 35.3 4.9 45.3 19.5 10.7 15.7 8.6 36.8-2.6 51.5-10.1 12-27.6 18.1-41.5 25.2z"
              fill="#12224c"
            />
          </svg>
          <sup
            class="_badge _badge_unread"
            v-if="chats_total_unread > 0"
            v-text="chats_total_unread"
          />
        </button> -->

        <div v-if="connected_as" class="_currentUser">
          <AuthorTag
            :path="connected_as.$path"
            :show_image_only="true"
            @click="showAuthorModal"
          />
          <sup
            class="_badge"
            v-if="$api.other_devices_connected.length > 0"
            v-text="$api.other_devices_connected.length"
          />
        </div>
        <button
          type="button"
          class="_authorBtn"
          v-else
          @click="$eventHub.$emit('showAuthorModal')"
        >
          {{ $t("login") }}
          <sup
            class="_badge"
            v-if="$api.other_devices_connected.length > 0"
            v-text="$api.other_devices_connected.length"
          />
        </button>
      </div>
    </div>
    <div class="_menu">
      <router-link to="/contribute" active-class="is--active">{{
        $t("contribute")
      }}</router-link>
      <router-link to="/explore" active-class="is--active"
        >{{ $t("explore") }}
      </router-link>
      <router-link to="/publish" active-class="is--active">
        {{ $t("publish") }}
      </router-link>
    </div>
  </div>
</template>
<script>
import LangModal from "@/adc-core/lang/LangModal.vue";
import AdminLumaSettings from "@/components/AdminLumaSettings.vue";
import QRModal from "@/adc-core/modals/QRModal.vue";

import authorMessageMixin from "@/adc-core/chats/mixins/authorMessageMixin";

export default {
  props: {},
  components: {
    AdminLumaSettings,
    LangModal,
    QRModal,
  },
  mixins: [authorMessageMixin],
  data() {
    return {
      show_admin_settings: false,
      show_lang_modal: false,
      show_qr_code_modal: false,
    };
  },
  i18n: {
    messages: {
      fr: {
        contribute: "Contribuer",
        explore: "Explorer",
        publish: "Publier",
      },
      en: {
        contribute: "Contribute",
        explore: "Explore",
        publish: "Publish",
      },
    },
  },
  created() {},
  async mounted() {
    await this.$api.getFolders({
      path: `authors`,
    });
    this.$api.join({ room: "authors" });
    this.$eventHub.$on(`toolbar.openAuthor`, this.showAuthorModal);
    this.$eventHub.$on(`toolbar.openCredits`, this.showCredits);

    if (this.connected_as) {
      await this.loadChatsAndDisplayUnreadMessages();
    }
  },
  beforeDestroy() {
    this.$api.leave({ room: "authors" });
    this.$eventHub.$off(`toolbar.openAuthor`, this.showAuthorModal);
    this.$eventHub.$off(`toolbar.openCredits`, this.showCredits);

    // Remove scroll event listener
    window.removeEventListener("scroll", this.handleScroll);
  },
  watch: {
    $route: {
      handler() {},
      immediate: true,
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    current_lang_code() {
      this.$i18n.availableLocales;
      return this.$i18n.locale;
    },
    url_to_page() {
      // for reactivity
      this.$route.path;
      return window.location.href;
    },
    chats_total_unread() {
      return this.chats.reduce((acc, chat) => {
        const index = this.getIndexFromChatPath(chat.$path);
        if (index) {
          const unread = chat.$files_count - index;
          if (unread > 0) return acc + unread;
        }
        return acc;
      }, 0);
    },
  },
  methods: {
    showAuthorModal() {
      this.$eventHub.$emit("showAuthorModal");
    },
  },
};
</script>
<style lang="scss" scoped>
._topBar {
  --topbar-font-size: 16px;

  display: flex;
  justify-content: space-between;
  align-items: stretch;
  // gap: 1rem;
  border-bottom: 1px solid var(--border-color);

  > * {
    flex: 1 1 50%;

    &:not(:last-child) {
      border-right: 1px solid var(--border-color);
    }
  }
}

._logoIcons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  // font-size: 20px;
  // justify-content: center;
}
._badge {
  position: absolute;
  right: -0.55rem;
  top: -0.55rem;
  color: white;
  background: var(--c-bleumarine);
  border-radius: 0.6rem;
  min-width: 1.2rem;
  height: 1.2rem;
  display: flex;
  padding: calc(var(--spacing) / 3);
  align-items: center;
  justify-content: center;
  font-weight: bold;

  ._logo {
    font-size: var(--topbar-font-size);
  }

  a {
    text-decoration: none;
    // color: var(--h-900);
    font-weight: normal;
  }
}

._menu {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-weight: 300;
  text-transform: uppercase;

  a {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 50px;
    padding: 10px;
    background-color: transparent;
    // border: 1px solid #ddd;
    border-radius: 0;
    font-size: var(--topbar-font-size);
    cursor: pointer;
    text-decoration: none;

    &.is--active {
      background-color: var(--h-600);
      color: white;
      // font-weight: bold;
    }
  }
}

.profile-icon {
  display: flex;
  align-items: center;
  padding: 0 1rem;
  flex: 0 0 auto;
  font-size: 2px;
  cursor: pointer;
}

._topRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  // margin: calc(var(--spacing) / 1) calc(var(--spacing) / 1) 0;
  color: currentColor;

  ._separator {
    flex: 1 1 auto;
  }
}

._chatsBtn {
  position: relative;
  display: inline-flex;
  padding: calc(var(--spacing) / 4);

  svg {
    width: 30px;
    height: 30px;
  }
}

._badge_unread {
  background: var(--c-rouge);
  top: -0.3rem;
  right: -0.3rem;
}

._currentUser {
  display: inline-flex;
  position: relative;
}
</style>
