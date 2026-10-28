<template>
  <BaseModal2 :title="$t('accounts_online')" @close="$emit('close')">
    <div class="_presence">
      <p v-if="presence.identified === 0" class="u-instructions">
        {{ $t("nobody_else_connected") }}
      </p>

      <ul v-if="presence.accounts.length > 0" class="_accounts">
        <li
          v-for="account in presence.accounts"
          :key="account.token_path"
          class="_account"
          :data-isself="account.is_self"
        >
          <div class="_who">
            <AuthorTag :path="account.token_path" :size="'small'" />
            <span class="_devices">
              <b-icon
                v-for="(device, index) in account.devices"
                :key="index"
                :icon="device"
                class="_deviceType"
              />
            </span>
          </div>
          <div class="_tabsCount">
            {{
              account.is_self
                ? $t("your_other_tabs")
                : $tc("open_tabs", account.tabs.length)
            }}
          </div>
          <ul class="_tabs">
            <li v-for="tab in account.tabs" :key="tab.id">
              <PresenceTabLink
                :path="tab.meta.path"
                :path_hidden="tab.meta.path_hidden"
                :path_titles="tab.meta.path_titles"
                @close="$emit('close')"
              />
            </li>
          </ul>
        </li>
      </ul>

      <p v-if="presence.anonymous > 0" class="_anonymous">
        <b-icon icon="person" />
        {{ $tc("presence_anonymous_count", presence.anonymous) }}
      </p>
    </div>
  </BaseModal2>
</template>
<script>
import PresenceTabLink from "@/adc-core/ui/PresenceTabLink.vue";

export default {
  props: {},
  components: {
    PresenceTabLink,
  },
  data() {
    return {};
  },
  computed: {
    presence() {
      return this.$api.presence;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._presence {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1);
}

._accounts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._account {
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;
  background: var(--c-gris_clair);

  &[data-isself] {
    background: var(--c-bleumarine_clair);
  }
}

._who {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 4);
}

._devices {
  display: inline-flex;
  gap: calc(var(--spacing) / 4);
}

._tabsCount {
  font-size: var(--sl-font-size-small);
  color: var(--c-gris_fonce);
}

._tabs {
  margin: 0;
  padding-left: calc(var(--spacing) * 1.5);
}

._anonymous {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 4);
  margin: 0;
  font-style: italic;
  color: var(--c-gris_fonce);
}

._deviceType {
  opacity: 0.6;
}
</style>
