<template>
  <div class="_adminWelcome">
    <h2 class="_title">{{ $t("admin_welcome_title") }}</h2>
    <p class="_intro">{{ $t("admin_welcome_intro") }}</p>

    <div v-if="default_password_in_use" class="_callout _callout--warning">
      <p>
        {{ $t("admin_welcome_default_admin", { password: default_password }) }}
      </p>
      <button
        type="button"
        class="u-button u-button_bleuvert"
        @click="show_change_password = true"
      >
        <b-icon icon="key" />
        {{ $t("admin_welcome_change_password") }}
      </button>
    </div>

    <div v-if="anyone_can_admin" class="_callout _callout--warning">
      <p>{{ $t("admin_welcome_anyone_can_admin") }}</p>
      <button
        type="button"
        class="u-button u-button_white"
        @click="goToTab('administration_and_access_control')"
      >
        {{ $t("administration_and_access_control") }}
      </button>
    </div>

    <h3>{{ $t("admin_welcome_steps") }}</h3>
    <ol class="_steps">
      <li v-if="default_password_in_use">
        <button
          type="button"
          class="u-buttonLink"
          @click="show_change_password = true"
        >
          {{ $t("admin_welcome_step_password") }}
        </button>
      </li>
      <li v-for="step in steps" :key="step.tab">
        <button
          type="button"
          class="u-buttonLink"
          @click="goToTab(step.tab)"
        >
          {{ $t(step.label) }}
        </button>
      </li>
    </ol>

    <h3>{{ $t("admin_welcome_sections") }}</h3>
    <div class="_cards">
      <button
        v-for="section in sections"
        :key="section.tab"
        type="button"
        class="_card"
        @click="goToTab(section.tab)"
      >
        <span class="_card--title">
          <b-icon :icon="section.icon" aria-hidden="true" />
          {{ $t(section.tab) }}
        </span>
        <span class="_card--text">
          {{ $t(`admin_tab_desc_${section.tab}`) }}
        </span>
      </button>
    </div>

    <ChangeAdminPasswordModal
      v-if="show_change_password"
      :default_password="default_password"
      @changed="checkDefaultPassword"
      @close="show_change_password = false"
    />
  </div>
</template>
<script>
import ChangeAdminPasswordModal from "@/adc-core/modals/ChangeAdminPasswordModal.vue";

export default {
  components: {
    ChangeAdminPasswordModal,
  },
  data() {
    return {
      // answer of the server: does the default admin account still have the
      // default password ? (unknown until the check is done)
      default_admin_status: undefined,
      default_password: "dodoc",
      show_change_password: false,

      steps: [
        { tab: "informations", label: "admin_welcome_step_informations" },
        {
          tab: "administration_and_access_control",
          label: "admin_welcome_step_access",
        },
        { tab: "logo_and_images", label: "admin_welcome_step_images" },
      ],
      sections: [
        { tab: "informations", icon: "info-circle" },
        { tab: "logo_and_images", icon: "image" },
        { tab: "administration_and_access_control", icon: "people" },
        { tab: "fonts", icon: "fonts" },
        { tab: "chats", icon: "chat-dots" },
        { tab: "events", icon: "calendar-event" },
        { tab: "terms", icon: "file-earmark-text" },
        { tab: "suggested_cat_kw", icon: "tag" },
        { tab: "storage", icon: "hdd" },
        { tab: "debug_logs", icon: "bug" },
      ],
    };
  },
  mounted() {
    this.checkDefaultPassword();
    // the welcome page is only pushed once per browser
    try {
      localStorage.setItem("admin_welcome_seen", "true");
    } catch (e) {}
  },
  methods: {
    goToTab(tab) {
      this.$router.push("/admin/" + tab);
    },
    async checkDefaultPassword() {
      this.default_admin_status = await this.$api
        .getDefaultAdminPasswordStatus()
        .catch(() => undefined);
    },
  },
  computed: {
    // the account created by default on a new instance has a public password:
    // shown until the account is removed or its password is changed
    default_password_in_use() {
      return (
        this.default_admin_status?.account_exists === true &&
        this.default_admin_status?.is_default_password === true
      );
    },
    anyone_can_admin() {
      return this.$root.app_infos.instance_meta.$admins === "everyone";
    },
  },
};
</script>
<style lang="scss" scoped>
._adminWelcome {
  max-width: 80ch;
}

._title {
  margin-top: 0;
}

._intro {
  margin-bottom: calc(var(--spacing) * 1.5);
}

._callout {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) / 1);
  background: var(--c-gris_clair);
  border-radius: var(--border-radius);

  p {
    margin: 0;
    flex: 1 1 30ch;
  }

  &--warning {
    background: var(--c-orange_clair, var(--c-gris_clair));
  }
}

._steps {
  margin: 0 0 calc(var(--spacing) * 1.5);
  padding-left: calc(var(--spacing) * 1.5);

  li {
    margin-bottom: calc(var(--spacing) / 4);
  }
}

._cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(26ch, 1fr));
  gap: calc(var(--spacing) / 2);
}

._card {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  gap: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 1);
  font: inherit;
  color: inherit;
  text-align: left;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  background: var(--c-gris_clair);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    border-color: var(--c-gris);
  }
}

._card--title {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  font-weight: 600;
}

._card--text {
  font-size: var(--sl-font-size-small);
  line-height: 1.3;
}
</style>
