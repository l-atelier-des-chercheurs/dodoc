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
          class="u-button u-button_icon _qrCodeBtn"
          :class="{
            'is--active': show_qr_code_modal,
          }"
          @click="show_qr_code_modal = true"
          :title="$t('share_link_to_page')"
        >
          <svg
            class="_qrCodeIcon"
            enable-background="new 0 0 90 90"
            viewBox="0 0 90 90"
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
          >
            <path
              d="m48 0v42h42v-42zm36 36h-30v-30h30zm-71 41h16v-16h-16zm-13 13h42v-42h-42zm6-36h30v30h-30zm57-6h-15v13h15zm6 6h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13v-17h-21zm-69-12h42v-42h-42zm6-36h30v30h-30zm84 84v-8h-8v8zm-77-61h16v-16h-16zm64-16h-16v16h16z"
            />
          </svg>
        </button>
        <QRModal
          v-if="show_qr_code_modal"
          :url_to_access="url_to_page"
          @close="show_qr_code_modal = false"
        />

        <button
          type="button"
          class="u-button u-button_icon _helpBtn"
          :class="{
            'is--active': show_credits_modal,
          }"
          :title="$t('about_dodoc')"
          @click="show_credits_modal = !show_credits_modal"
        >
          <svg
            class="_helpIcon"
            enable-background="new 0 0 168 168"
            viewBox="0 0 168 168"
            xmlns="http://www.w3.org/2000/svg"
            :aria-label="$t('about_dodoc')"
          >
            <circle cx="84" cy="84" r="84" fill="none" />
            <path
              d="m101.1 38.2c4.2 2 7.3 4.6 9.4 7.8 2.1 3.3 3.1 6.8 3.1 10.6 0 3.6-.6 6.6-1.8 9.1s-2.7 4.5-4.4 6-4 3.3-6.9 5.3c-3.5 2.3-6 4.5-7.7 6.4s-2.5 4.5-2.5 7.6v4h-17v-4.6c0-4 .6-7.4 1.9-10.1 1.3-2.8 2.8-5 4.6-6.6s4-3.4 6.7-5.2c2.8-1.8 4.8-3.4 6-4.8 1.3-1.4 1.9-3.2 1.9-5.3 0-2.7-.9-4.7-2.7-6.2-1.8-1.4-4.2-2.1-7.3-2.1-5.9 0-11.2 2.7-15.9 8.2l-12-9.2c3.8-4.4 8.1-7.8 13-10.1s10.4-3.5 16.6-3.5c5.8-.2 10.9.8 15 2.7zm-11.3 72.3c2.2 2.2 3.3 4.8 3.3 7.8s-1.1 5.7-3.3 7.9-4.8 3.3-7.9 3.3-5.7-1.1-7.9-3.2c-2.1-2.2-3.2-4.8-3.2-7.9 0-3 1.1-5.6 3.2-7.8s4.7-3.3 7.9-3.3 5.7 1 7.9 3.2z"
              fill="#353535"
            />
          </svg>
        </button>
        <CreditsModal
          v-if="show_credits_modal"
          @close="show_credits_modal = false"
        />

        <template v-if="is_instance_admin">
          <button
            type="button"
            class="u-button u-button_icon _settingsBtn"
            :class="{
              'is--active': show_settings_modal,
            }"
            @click="show_settings_modal = !show_settings_modal"
          >
            <svg
              class="_settingsIcon"
              enable-background="new 0 0 168 168"
              viewBox="0 0 168 168"
              xmlns="http://www.w3.org/2000/svg"
              :aria-label="$t('admin_settings')"
            >
              <circle cx="84" cy="84" r="84" fill="none" />
              <g transform="scale(1.22) translate(-14 -14)">
                <path
                  d="m122.7 88.8v-10c0-1.1.6-2.1 1.6-2.6l9.6-4.9-2-5.8-11 1.6c-1.1.2-2.2-.3-2.9-1.2l-6-8.1c-.7-.9-.8-2.1-.3-3l4.8-9.6-5.2-3.6-7.7 7.5c-.8.8-2 1-3.1.7l-9.9-3c-1.1-.3-1.9-1.3-2.1-2.4l-1.7-10.4h-6.4l-1.7 10.4c-.2 1.1-.9 2-2 2.4l-9.9 3.2c-1.1.3-2.2.1-3.1-.7l-7.8-7.3-5.1 3.7 4.9 9.4c.5 1 .4 2.1-.2 3l-6 8.2c-.6.9-1.8 1.4-2.9 1.2l-10.8-1.5-1.8 5.8 9.7 4.8c1 .5 1.7 1.5 1.7 2.6v10c0 1.1-.6 2.1-1.6 2.6l-9.6 4.9 2 5.9 10.9-1.6c1.1-.2 2.2.3 2.9 1.2l6 8.1c.7.9.8 2.1.3 3l-4.8 9.6 5.1 3.6 7.7-7.5c.8-.8 2-1 3.1-.7l9.9 3c1.1.3 1.9 1.3 2.1 2.4l1.9 10.4h6.4l1.7-10.4c.2-1.1.9-2 2-2.4l9.9-3.2c1.1-.3 2.2-.1 3.1.7l7.8 7.3 5.1-3.7-4.9-9.4c-.5-1-.4-2.1.2-3l6-8.1c.7-.9 1.8-1.4 2.9-1.2l10.8 1.5 1.8-5.9-9.7-4.8c-1.1-.6-1.7-1.6-1.7-2.7zm-38.7 15.7c-11.7 0-21.1-9.2-21.1-20.5s9.5-20.5 21.1-20.5 21.1 9.2 21.1 20.5-9.4 20.5-21.1 20.5z"
                  fill="#12224c"
                />
              </g>
            </svg>
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
              :fill="$root.show_chats_list ? '#fc4b60' : 'none'"
            />
            <path
              d="m70.5 104.6c-13.4-13.6-18.6-35-9.8-52.6 8.2-16.4 25.2-27.6 43.9-26.4 19.4 1.3 37.3 14.7 42 34 4.8 19.8-3 39.3-19.9 50.7-2 1.4-2.5 3.6-1.5 5.8 1.3 2.6 2.6 5.3 3.9 7.9.8 1.7 1.6 3.3 2.4 5 .4.8 1.1 1.3.1 1-5-1.7-10-3.5-15.1-5.2-15.1-5.4-33.9-9.3-46-20.2z"
              :fill="$root.show_chats_list ? '#fc4b60' : 'none'"
            />
            <path
              d="m66.7 109.3c14.6 13.3 37.8 17.9 56.2 24.3 5.4 1.9 15.2 6.2 17.3-2.3 1.2-5-3.3-12.3-6.3-17.7 16.7-13 25.7-34.7 19.6-55.7-6.1-20.8-24.3-37-46.3-38.5-21.7-1.4-44.1 10.7-52.3 31.5-8.1 20.5-3.8 42.7 11.8 58.4zm5.6-5.9c-13-13.1-18-33.7-9.4-50.7 7.9-15.8 24.3-26.6 42.3-25.4 18.7 1.2 35.9 14.2 40.5 32.7 4.7 19.1-2.9 37.9-19.1 48.8-2 1.3-2.4 3.5-1.4 5.6 1.2 2.6 2.5 5.1 3.7 7.7.8 1.6 1.6 3.2 2.3 4.8.4.8 1.1 1.3.1 1-4.8-1.7-9.7-3.4-14.5-5.1-14.7-5.1-32.8-8.8-44.5-19.4z"
              fill="#12224c"
            />
            <path
              d="m60.4 137.4c-4.8 2.4-9.6 4.9-14.4 7.3-.9.5-.3-.1 0-1 .6-1.8 1.2-3.6 1.8-5.4.9-2.8 1.9-5.7 2.8-8.5.8-2.3 0-4.5-2.3-5.6-18.5-9.1-29-27.7-26.8-48.2 2-20 18.2-35.9 37.5-39.8 18.7-3.8 37.2 5.2 47.7 20.5 11.3 16.5 9 38.7-2.7 54.2-10.6 12.6-29 19.1-43.6 26.5z"
              :fill="$root.show_chats_list ? '#fc4b60' : 'none'"
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

._currentUser,
._authorBtn {
  margin-left: calc(var(--spacing) / 2);
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
  gap: calc(var(--spacing) / 4);
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

    &:hover,
    &:focus,
    &.is--active {
      background: var(--c-rouge, #f0f0f0);
      svg {
      }
    }
  }
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

._chatsBtn,
._settingsBtn,
._helpBtn,
._qrCodeBtn {
  position: relative;
  display: inline-flex;
  width: 2.7rem;
  height: 2.7rem;
  padding: calc(var(--spacing) / 3);

  svg {
    width: 2.2rem;
    height: 2.2rem;
    fill: var(--c-noir);

    &._qrCodeIcon {
      width: 1.4rem;
      height: 1.4rem;
    }
  }

  // &:hover svg {
  //   fill: #fc4b60;
  // }
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
