<template>
  <div
    class="_topbar"
    :class="{
      'is--homepage': $route.path === '/',
      'is--mobileView': $root.is_mobile_view,
      'is--folded': isScrolledDown,
      'is--uptop': scroll_top === 0,
    }"
  >
    <div class="_topbar--inner">
      <BreadCrumbs class="_bc" />

      <div class="_topRightButtons">
        <button
          type="button"
          class="u-button u-button_icon"
          @click="show_qr_code_modal = true"
          :title="$t('share_link_to_page')"
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
          :title="$t('about_dodoc')"
          @click="show_credits_modal = !show_credits_modal"
        >
          <b-icon icon="patch-question" />
        </button>
        <CreditsModal
          v-if="show_credits_modal"
          @close="show_credits_modal = false"
        />

        <template v-if="is_instance_admin">
          <button
            type="button"
            class="u-button u-button_icon"
            @click="show_settings_modal = !show_settings_modal"
          >
            <b-icon icon="gear" :aria-label="$t('admin_settings')" />
          </button>

          <AdminSettings
            v-if="show_settings_modal"
            @close="show_settings_modal = false"
          />
        </template>

        <button
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
        </button>

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
          class="u-button u-button_bleumarine _authorBtn"
          v-else
          @click="showAuthorModal"
        >
          {{ $t("login") }}
          <sup
            class="_badge"
            v-if="$api.other_devices_connected.length > 0"
            v-text="$api.other_devices_connected.length"
          />
        </button>

        <!-- <div
          class="_currentUsers"
          v-if="$api.other_devices_connected.length > 0"
        >
          <router-link :to="'/@'" class="u-button u-button_icon">
            <b-icon icon="person-circle" />
            <sup class="_badge">
              {{ $api.other_devices_connected.length }}
            </sup>
          </router-link>
        </div> -->
      </div>

      <AuthorList
        v-if="show_authors_modal"
        @close="show_authors_modal = false"
      />
    </div>
  </div>
</template>
<script>
import AuthorList from "@/adc-core/author/AuthorList.vue";
import CreditsModal from "@/adc-core/modals/CreditsModal.vue";
import BreadCrumbs from "@/components/nav/BreadCrumbs.vue";

import authorMessageMixin from "@/adc-core/chats/mixins/authorMessageMixin";

export default {
  props: {},
  components: {
    AdminSettings: () => import("@/adc-core/AdminSettings.vue"),
    AuthorList,
    CreditsModal,
    BreadCrumbs,
  },
  mixins: [authorMessageMixin],
  data() {
    return {
      show_users_modal: false,
      show_authors_modal: false,
      show_credits_modal: false,
      show_qr_code_modal: false,
      show_settings_modal: false,
      show_chats_modal: false,
      isScrolledDown: false,
      lastScrollTop: 0,
      scroll_top: 0,
      scrollDelta: 0,

      chats: [],
    };
  },
  created() {},
  async mounted() {
    await this.$api.getFolders({
      path: `authors`,
    });
    this.$api.join({ room: "authors" });
    this.$eventHub.$on(`toolbar.openAuthor`, this.showAuthorModal);
    this.$eventHub.$on(`toolbar.openCredits`, this.showCredits);
    // Add scroll event listener
    window.addEventListener("scroll", this.handleScroll);

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
  computed: {
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
    handleScroll() {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      this.scroll_top = currentScrollTop;

      const scrollDifference = currentScrollTop - this.lastScrollTop;

      // Accumulate scroll delta when scrolling up
      if (scrollDifference < 0) {
        this.scrollDelta -= scrollDifference;
      } else {
        // Reset delta when scrolling down
        this.scrollDelta = 0;
      }

      // Fold when scrolling down past threshold
      if (scrollDifference > 0 && currentScrollTop > 50) {
        this.isScrolledDown = true;
      }
      // Unfold only after scrolling up 50px
      else if (this.scrollDelta > 50) {
        this.isScrolledDown = false;
        this.scrollDelta = 0;
      }

      this.lastScrollTop = currentScrollTop;
    },
    showAuthorModal() {
      this.show_authors_modal = true;
    },
    showCredits() {
      this.show_credits_modal = true;
    },
    async loadChatsAndDisplayUnreadMessages() {
      const path = `chats`;
      const chats = await this.$api.getFolders({
        path,
      });
      this.chats = chats;
      this.$api.join({ room: path });
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  position: sticky;
  top: 0;

  z-index: 5;

  max-width: calc(
    min(var(--max-column-width), var(--max-column-width-px)) + var(--spacing) *
      3
  );
  // margin: var(--spacing) auto;
  // margin: 0 auto;
  margin: 0 auto;
  // border: 1px solid var(--c-gris);

  // border-style: ridge;
  border-radius: 0 0 24px 24px;
  overflow: hidden;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:not(.is--uptop) {
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.05));
    // padding-top: var(--spacing);
  }

  &.is--folded {
    transform: translateY(-100%);
  }

  &.is--homepage {
  }
}

._topbar--inner {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
  overflow: hidden;

  width: 100%;
  // max-width: calc(var(--max-column-width));
  margin: 0 auto;
  padding: calc(var(--spacing) / 1) calc(var(--spacing) / 2);
  // padding-bottom: calc(var(--spacing) * 1);
  background: white;
  // border-bottom: 1px solid var(--c-gris);

  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  // min-height: 60px;
  user-select: none;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  > * {
    flex: 1 1 auto;

    &._bc {
      flex: 1 0 0;
      overflow: hidden;
    }
    &._topRightButtons {
      flex: 0 0 auto;
    }
  }

  > ._subscribeBtn {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

._subscribeBtn {
  position: relative;
  // margin-left: calc(var(--spacing) / 2);
  // .is--mobileView & {
  //   margin-left: 0;
  // }
}
._authorBtn {
  position: relative;
  // background: var(--c-bleumarine_clair);
  // padding: calc(var(--spacing) / 2);
  border-radius: 24px;
  // font-weight: 500;
  // font-size: var(--sl-font-size-normal);
  // color: inherit;
}

._topRightButtons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
  padding: 0 calc(var(--spacing) / 2);
  align-items: center;
  // crispy crisp icons
  // font-size: 111%;

  .is--mobileView & {
    padding: 0;
  }

  button {
    // width: 3rem;
    // font-size: inherit;
    // height: 3rem;

    .is--mobileView & {
      padding: calc(var(--spacing) / 2);
    }
  }
}

._adminInfo {
  position: absolute;
  top: 0;
  left: 0;
  font-weight: normal;
  text-align: center;
  width: 100%;
  justify-content: center;
  /* right: 0; */
  text-decoration: none;
  font-size: 80%;
}

._currentUsers {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
