<template>
  <div
    class="_topbar"
    :class="{
      'is--homepage': $route.path === '/',
      'is--mobileView': $root.is_mobile_view,
    }"
  >
    <BreadCrumbs class="_bc" />

    <div class="_topRightButtons">
      <button type="button" class="u-button" @click="show_qr_code_modal = true">
        <sl-icon name="qr-code" />
      </button>
      <QRModal
        v-if="show_qr_code_modal"
        :url_to_access="url_to_page"
        @close="show_qr_code_modal = false"
      />

      <button
        type="button"
        class="u-button"
        @click="show_lang_modal = !show_lang_modal"
      >
        {{ current_lang_code }}
      </button>
      <LangModal v-if="show_lang_modal" @close="show_lang_modal = false" />
      <div class="_subscribeBtn">
        <button type="button" class="_authorBtn" @click="showAuthorModal">
          <span class="u-buttonLink _adminInfo" v-if="is_instance_admin">
            {{ "admin" }}
          </span>

          <template v-if="connected_as">
            {{ connected_as.name }}
          </template>
          <template v-else>{{ $t("login") }}</template>
        </button>
      </div>
    </div>

    <AuthorList v-if="show_authors_modal" @close="show_authors_modal = false" />
  </div>
</template>
<script>
import AuthorList from "@/adc-core/author/AuthorList.vue";
import LangModal from "@/adc-core/lang/LangModal.vue";
import BreadCrumbs from "@/components/nav/BreadCrumbs.vue";

export default {
  props: {},
  components: {
    AuthorList,
    LangModal,
    BreadCrumbs,
  },
  data() {
    return {
      show_authors_modal: false,
      show_lang_modal: false,
      show_qr_code_modal: false,
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
  },
};
</script>
<style lang="scss" scoped>
._topbar {
  // position: sticky;
  // top: 0;
  position: relative;
  z-index: 5;

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
  border-bottom: 1px solid var(--c-gris);

  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  // min-height: 60px;
  user-select: none;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--homepage {
    // background: transparent;
    // border-bottom: 1px solid var(--c-gris);
    box-shadow: none;
  }

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
  margin-left: calc(var(--spacing) / 2);

  ._authorBtn {
    position: relative;
    background: var(--c-bleumarine_clair);
    padding: calc(var(--spacing) / 2);
    border-radius: 4px;
    font-weight: 500;
    font-size: var(--sl-font-size-normal);
  }
}

._topRightButtons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 4);
  padding: 0 calc(var(--spacing) / 2);
  // crispy crisp sl-icons
  font-size: 111%;

  button {
    // width: 3rem;
    font-size: inherit;
    height: 3rem;
    background: transparent;

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
</style>
