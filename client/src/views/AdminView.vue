<template>
  <div class="_adminView">
    <header class="_header">
      <h1>{{ $t("admin_settings") }}</h1>
    </header>

    <div v-if="!is_instance_admin" class="_restricted">
      <p>{{ $t("admin_page_restricted") }}</p>
      <router-link to="/" class="u-buttonLink">
        <b-icon icon="house" />
        {{ $t("home") }}
      </router-link>
    </div>

    <div v-else class="_layout">
      <nav class="_nav" :aria-label="$t('admin_settings')">
        <router-link
          v-for="tab in tabs"
          :key="tab.key"
          :to="'/admin/' + tab.key"
          class="_navItem"
          :class="{ 'is--active': tab.key === current_tab }"
          :aria-current="tab.key === current_tab ? 'page' : undefined"
        >
          <b-icon :icon="tab.icon" aria-hidden="true" />
          <span>{{ tab.text }}</span>
        </router-link>
      </nav>

      <main class="_content">
        <!-- the same component serves every settings tab, so only moving
          between "welcome" and a settings tab transitions here -->
        <transition name="admintab" mode="out-in">
          <router-view :key="$route.name" />
        </transition>
      </main>
    </div>
  </div>
</template>
<script>
import DynamicTitle from "@/mixins/DynamicTitle.js";

export default {
  mixins: [DynamicTitle],
  data() {
    return {};
  },
  created() {
    this.$api.updateSelfPath("/");
  },
  mounted() {
    this.updateDocumentTitle(this.$t("admin_settings"));
  },
  watch: {
    current_tab() {
      window.scrollTo({ top: 0 });
    },
  },
  computed: {
    tabs() {
      return [
        { key: "welcome", text: this.$t("admin_welcome"), icon: "stars" },
        {
          key: "informations",
          text: this.$t("informations"),
          icon: "info-circle",
        },
        {
          key: "logo_and_images",
          text: this.$t("logo_and_images"),
          icon: "image",
        },
        {
          key: "administration_and_access_control",
          text: this.$t("administration_and_access_control"),
          icon: "people",
        },
        { key: "fonts", text: this.$t("fonts"), icon: "fonts" },
        { key: "chats", text: this.$t("chats"), icon: "chat-dots" },
        { key: "events", text: this.$t("events"), icon: "calendar-event" },
        {
          key: "terms",
          text: this.$t("terms"),
          icon: "file-earmark-text",
        },
        {
          key: "suggested_cat_kw",
          text: this.$t("suggested_cat_kw"),
          icon: "tag",
        },
        { key: "storage", text: this.$t("storage"), icon: "hdd" },
        { key: "debug_logs", text: this.$t("debug_logs"), icon: "bug" },
      ];
    },
    // the section shown, read from /admin/<section>
    current_tab() {
      return this.$route.path.split("/")[2] || "welcome";
    },
  },
};
</script>
<style lang="scss">
// switching section: a bit quicker than the global fade
.admintab {
  &-enter-active,
  &-leave-active {
    opacity: 1;
    transition: opacity 0.17s cubic-bezier(0.19, 1, 0.22, 1);
  }
  &-enter,
  &-leave-to {
    opacity: 0;
    transition: opacity 0.17s cubic-bezier(0.19, 1, 0.22, 1);
  }
}
</style>
<style lang="scss" scoped>
._adminView {
  max-width: 1200px;
  margin: 0 auto;
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 1);
}

._header h1 {
  margin: 0 0 calc(var(--spacing) * 1.5);
}

._restricted {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 2);
}

._layout {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) * 2);

  @media (max-width: 800px) {
    flex-flow: column nowrap;
    align-items: stretch;
  }
}

._nav {
  position: sticky;
  top: calc(var(--spacing) * 4);
  flex: 0 0 26ch;
  display: flex;
  flex-flow: column nowrap;
  gap: 2px;

  @media (max-width: 800px) {
    position: static;
    flex: 0 0 auto;
    flex-flow: row nowrap;
    overflow-x: auto;
    padding-bottom: calc(var(--spacing) / 2);
  }
}

._navItem {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) calc(var(--spacing) / 1);
  color: inherit;
  text-decoration: none;
  border-radius: var(--input-border-radius);
  white-space: nowrap;

  &:hover,
  &:focus-visible {
    background: var(--c-gris_clair);
  }

  &.is--active {
    background: var(--c-gris);
    font-weight: 600;
  }
}

._content {
  flex: 1 1 0;
  min-width: 0;
}
</style>
