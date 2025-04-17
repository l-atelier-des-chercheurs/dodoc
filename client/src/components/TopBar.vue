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
      </div>
    </div>
    <div class="_menu">
      <router-link to="/contribute" active-class="active">DÉPOSER</router-link>
      <router-link to="/corpus" active-class="active">FAÇONNER</router-link>
    </div>
    <div class="profile-icon">
      <AuthorTag
        v-if="connected_as"
        :path="connected_as.$path"
        :show_image_only="true"
        @click="$eventHub.$emit('showAuthorModal')"
      />
      <button
        type="button"
        class="_authorBtn"
        v-else
        @click="$eventHub.$emit('showAuthorModal')"
      >
        {{ $t("login") }}
      </button>
    </div>
  </div>
</template>
<script>
import LangModal from "@/adc-core/lang/LangModal.vue";
import AdminLumaSettings from "@/components/AdminLumaSettings.vue";
import QRModal from "@/adc-core/modals/QRModal.vue";

export default {
  props: {},
  components: {
    AdminLumaSettings,
    LangModal,
    QRModal,
  },
  data() {
    return {
      show_admin_settings: false,
      show_lang_modal: false,
      show_qr_code_modal: false,
    };
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
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._topBar {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  height: 50px;
  // gap: 1rem;
  border-bottom: 1px solid var(--h-500);

  > * {
    flex: 1 1 0;

    &:not(:last-child) {
      border-right: 1px solid var(--h-500);
    }
  }
}

._logoIcons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;

  // font-size: 20px;
  font-weight: bold;

  ._logo {
    font-size: 20px;
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
  font-size: 16px;

  a {
    flex: 1 1 0;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 10px 20px;
    background-color: transparent;
    // border: 1px solid #ddd;
    border-radius: 0;
    cursor: pointer;
    text-decoration: none;

    &:hover {
      background-color: var(--h-200);
    }

    &.active {
      background-color: var(--h-700);
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
</style>
