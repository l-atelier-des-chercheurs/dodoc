<template>
  <div
    class="_topbar"
    :class="{
      'is--homepage': $route.path === '/',
    }"
  >
    <BreadCrumbs />

    <div class="_topRightButtons">
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
      // show_settings: false,
      show_lang_modal: false,
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
  position: relative;
  z-index: 5;
  // position: absolute;
  width: 100%;
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 2);
  align-items: center;

  padding: calc(var(--spacing) / 2);
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);

  // min-height: 60px;
  user-select: none;

  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);

  &.is--homepage {
    background: transparent;
    box-shadow: none;
  }

  > * {
    flex: 1 1 0;
  }

  > ._subscribeBtn {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

._subscribeBtn {
  ._authorBtn {
    background: var(--c-bleumarine_clair);
    padding: calc(var(--spacing) / 2);
    border-radius: 4px;
    font-weight: 300;
    font-size: var(--sl-font-size-large);
  }
}

._topRightButtons {
  display: flex;
  justify-content: flex-end;
  gap: calc(var(--spacing) / 2);
  padding: 0 calc(var(--spacing) / 2);

  button {
    // width: 3rem;
    height: 3rem;
    background: transparent;
  }
}
</style>
