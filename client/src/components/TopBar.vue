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

        <AuthorTag
          v-if="connected_as"
          :path="connected_as.$path"
          :show_image_only="true"
          @click="showAuthorModal"
        />
        <button
          type="button"
          class="u-button u-button_bleumarine _authorBtn"
          v-else
          @click="showAuthorModal"
        >
          {{ $t("login") }}
          <sup class="_badge">
            {{ $api.other_devices_connected.length }}
          </sup>
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

export default {
  props: {},
  components: {
    AdminSettings: () => import("@/adc-core/AdminSettings.vue"),
    AuthorList,
    CreditsModal,
    BreadCrumbs,
  },
  data() {
    return {
      show_users_modal: false,
      show_authors_modal: false,
      show_credits_modal: false,
      show_qr_code_modal: false,
      show_settings_modal: false,
      isScrolledDown: false,
      lastScrollTop: 0,
      scroll_top: 0,
      scrollDelta: 0,
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
  margin: 0 auto var(--spacing);
  // border: 1px solid var(--c-gris);

  // border-style: ridge;
  border-radius: 0 0 24px 24px;
  overflow: hidden;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &:not(.is--uptop) {
    filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.1));
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
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 2);
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
  right: -0.4rem;
  top: -0.4rem;
  color: white;
  background: var(--c-bleumarine);
  border-radius: 0.75em;
  min-width: 1.2rem;
  height: 1rem;
  display: flex;
  padding: 2px;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
</style>
