<template>
  <div
    class="_topbar"
    :class="{
      'is--homepage': $route.path === '/',
      'is--mobileView': $root.is_mobile_view,
    }"
  >
    <div class="_topbar--row">
      <div class="_logoBack">
        <button
          type="button"
          class="u-button u-button_icon _backButton"
          v-if="$root.app_infos.is_electron"
          @click="goBack"
        >
          <b-icon icon="chevron-left" />
        </button>

        <div class="_logo">
          <component
            :is="$route.name !== 'Accueil' ? 'router-link' : 'span'"
            :to="`/`"
          >
            <DodocLogo class="_dodocLogo" v-if="instance_logo === 'dodoc'" />
            <img class="_customLogo" v-else :src="instance_logo" />
          </component>
        </div>
      </div>
      <div class="_topRightButtons">
        <button
          type="button"
          class="u-button u-button_transparent"
          @click="show_qr_code_modal = true"
        >
          <sl-icon name="qr-code" :aria-label="$t('share_link_to_page')" />
        </button>
        <QRModal
          v-if="show_qr_code_modal"
          :url_to_access="url_to_page"
          @close="show_qr_code_modal = false"
        />

        <button
          type="button"
          class="u-button u-button_transparent"
          @click="show_lang_modal = !show_lang_modal"
        >
          {{ current_lang_code }}
        </button>
        <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />
        <div class="_subscribeBtn">
          <AuthorTag
            v-if="connected_as"
            :path="connected_as.$path"
            :show_image_only="$root.is_mobile_view"
            @click="showAuthorModal"
          />
          <button
            type="button"
            class="_authorBtn"
            v-else
            @click="showAuthorModal"
          >
            {{ $t("login") }}
          </button>
        </div>

        <template v-if="is_instance_admin">
          <button
            type="button"
            class="u-button u-button_transparent"
            @click="show_settings_modal = !show_settings_modal"
          >
            <b-icon icon="gear" :aria-label="$t('admin_settings')" />
          </button>
          <AdminSettings
            v-if="show_settings_modal"
            @close="show_settings_modal = false"
          />
        </template>
      </div>
    </div>

    <div class="_topbar--row" v-if="$route.path !== '/'">
      <BreadCrumbs class="_bc" />
    </div>

    <AuthorList v-if="show_authors_modal" @close="show_authors_modal = false" />
  </div>
</template>
<script>
import DodocLogo from "@/components/nav/DodocLogo.vue";
import AuthorList from "@/adc-core/author/AuthorList.vue";
import LangModal from "@/adc-core/lang/LangModal.vue";
import BreadCrumbs from "@/components/nav/BreadCrumbs.vue";

export default {
  props: {},
  components: {
    DodocLogo,

    AdminSettings: () => import("@/adc-core/AdminSettings.vue"),
    AuthorList,
    LangModal,
    BreadCrumbs,
  },
  data() {
    return {
      show_authors_modal: false,
      show_lang_modal: false,
      show_qr_code_modal: false,
      show_settings_modal: false,
    };
  },
  created() {},
  async mounted() {
    await this.$api.getFolders({
      path: `authors`,
    });
    this.$api.join({ room: "authors" });
    this.$eventHub.$on(`toolbar.openAuthor`, this.showAuthorModal);
  },
  beforeDestroy() {
    this.$api.leave({ room: "authors" });
    this.$eventHub.$off(`toolbar.openAuthor`, this.showAuthorModal);
  },
  watch: {
    $route: {
      handler() {},
      immediate: true,
    },
  },
  computed: {
    instance_logo() {
      return this.$root.app_infos.instance_meta.topbar_thumb || "dodoc";
    },

    current_lang_code() {
      this.$i18n.availableLocales;
      return this.$i18n.locale;
    },
    url_to_page() {
      // for reactivity
      this.$route.path;
      return window.location.href;
    },
  },
  methods: {
    showAuthorModal() {
      this.show_authors_modal = true;
    },
    goBack() {
      window.history.back();
    },
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  // position: sticky;
  // top: 0;
  position: relative;
  z-index: 5;
  width: 100%;
}

._topbar--row {
  display: flex;
  flex-flow: row nowrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;
  overflow: hidden;
  margin: 0 auto;
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background: white;
  border-bottom: 1px solid var(--c-gris);

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

._logo {
  flex: 0 0 auto;

  svg {
    width: 120px;
  }

  img {
    width: auto;
    border-radius: 4px;
  }

  svg,
  img {
    height: 40px;
    object-fit: scale-down;
    object-position: 0 0;
  }

  ._customLogo {
    border-radius: 2px;
    border: 2px solid var(--c-gris_clair);
    transition: 0.2s cubic-bezier(0.19, 1, 0.22, 1);
  }

  a {
    ._dodocLogo,
    ._customLogo {
      &:hover,
      :focus-visible {
        opacity: 0.9;
        border-color: var(--c-gris);
      }
    }
  }
}

._subscribeBtn {
  // margin-left: calc(var(--spacing) / 2);
  // .is--mobileView & {
  //   margin-left: 0;
  // }

  ._authorBtn {
    position: relative;
    background: var(--c-bleumarine_clair);
    padding: calc(var(--spacing) / 2);
    border-radius: 4px;
    font-weight: 500;
    font-size: var(--sl-font-size-normal);
    color: inherit;
  }
}

._topRightButtons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 4);
  padding: 0 calc(var(--spacing) / 2);
  // crispy crisp sl-icons
  font-size: 111%;

  .is--mobileView & {
    padding: 0;
  }

  button {
    // width: 3rem;
    font-size: inherit;
    height: 3rem;

    .is--mobileView & {
      padding: calc(var(--spacing) / 2);
    }
  }
}

._logoBack {
  display: flex;
  flex-flow: row nowrap;
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
</style>
