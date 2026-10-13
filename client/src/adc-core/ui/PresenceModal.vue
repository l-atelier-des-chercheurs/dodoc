<template>
  <BaseModal2 :title="$t('presence')" @close="$emit('close')">
    <div class="_presence">
      <p v-if="presence.identified === 0" class="u-instructions">
        {{ $t("nobody_else_connected") }}
      </p>
      <template v-else>
        <div class="_summary">
          <span class="_count">
            <b-icon icon="people-fill" />
            {{ presence.identified }}
            {{ $tc("presence_identified", presence.identified) }}
          </span>
        </div>

        <ul class="_browsers">
          <li
            v-for="browser in presence.others"
            :key="browser.browser_id"
            class="_browser"
          >
            <div class="_who">
              <AuthorTag :path="browser.token_path" :size="'small'" />
              <b-icon :icon="browser.device || 'laptop'" class="_deviceType" />
              <small
                v-if="browser.tabs.length > 1"
                class="_tabsCount"
                v-text="$tc('open_tabs', browser.tabs.length)"
              />
            </div>
            <ul class="_tabs">
              <li v-for="tab in browser.tabs" :key="tab.id">
                <PresenceTabLink
                  :path="tab.meta.path"
                  :path_hidden="tab.meta.path_hidden"
                  @close="$emit('close')"
                />
              </li>
            </ul>
          </li>
        </ul>
      </template>

      <p v-if="presence.anonymous > 0" class="_anonymous">
        <b-icon icon="person" />
        {{ $tc("presence_anonymous_count", presence.anonymous) }}
      </p>

      <div v-if="presence.self_other_tabs.length > 0" class="_selfTabs">
        <h3 v-text="$t('your_other_tabs')" />
        <ul class="_tabs">
          <li v-for="tab in presence.self_other_tabs" :key="tab.id">
            <PresenceTabLink :path="tab.meta.path" @close="$emit('close')" />
          </li>
        </ul>
      </div>
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

._summary {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);

  ._count {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--spacing) / 4);
    font-weight: bold;
    font-size: var(--sl-font-size-large);
  }
}

._browsers {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._browser {
  padding: calc(var(--spacing) / 2);
  border-radius: 4px;
  background: var(--c-gris_clair);
}

._who {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  margin-bottom: calc(var(--spacing) / 4);
}

._tabsCount {
  color: var(--c-gris_fonce);
}

._tabs {
  margin: 0;
  padding-left: calc(var(--spacing) * 1.5);
}

._selfTabs h3 {
  margin: 0 0 calc(var(--spacing) / 4);
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
