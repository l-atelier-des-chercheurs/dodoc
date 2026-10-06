<template>
  <div>
    <!-- portal: escape any stacking context so it shows above everything -->
    <portal to="destination">
      <div
        v-if="is_reconnected"
        key="reconnected"
        class="_disconnectModal is--reconnected"
        role="status"
      >
        <div class="_disconnectModal--row">
          <b-icon icon="check-circle-fill" aria-hidden="true" />
          <span class="_disconnectModal--label">
            {{ $t("connection_back") }}
          </span>
        </div>
      </div>
      <div
        v-else-if="!$api.connected && is_visible && !show_help_modal"
        key="disconnected"
        class="_disconnectModal"
        role="status"
      >
        <div class="_disconnectModal--row">
          <span class="_disconnectModal--dot" aria-hidden="true" />
          <span class="_disconnectModal--label">
            {{ $t("connection_lost") }}
          </span>

          <button
            type="button"
            class="_disconnectModal--retry"
            :disabled="is_reconnecting"
            @click="reconnectSocket"
          >
            <!-- label stays in the flow (hidden) so the button never changes width -->
            <span
              class="_disconnectModal--retryLabel"
              :class="{ 'is--hidden': is_reconnecting }"
            >
              {{ $t("retry") }}
              <span class="_disconnectModal--countdown">{{
                reconnecting_in
              }}</span>
            </span>
            <LoaderSpinner v-if="is_reconnecting" class="_spinner" />
          </button>
        </div>

        <p class="_disconnectModal--details">
          <template v-if="is_persistent">
            {{ $t("changes_may_not_be_saved") }}
            <template v-if="contactmail">
              {{ $t("if_issues_contact") }}
              <a :href="'mailto:' + contactmail" target="_blank">{{
                contactmail
              }}</a
              >.
            </template>
            <br />
          </template>
          <button
            type="button"
            class="_disconnectModal--more"
            @click="show_help_modal = true"
          >
            {{ $t("more_informations") }}
          </button>
        </p>
      </div>
    </portal>

    <BaseModal2
      v-if="show_help_modal"
      :title="$t('connection_lost')"
      @close="show_help_modal = false"
    >
      <div class="_disconnectHelp">
        <p>{{ $t("connection_lost_help_intro") }}</p>
        <p>
          <strong>{{ $t("changes_may_not_be_saved") }}</strong>
          {{ $t("connection_lost_help_live") }}
        </p>

        <h3>{{ $t("connection_lost_help_causes") }}</h3>
        <ul>
          <li>{{ $t("connection_lost_help_cause_network") }}</li>
          <li>{{ $t("connection_lost_help_cause_server") }}</li>
          <li>{{ $t("connection_lost_help_cause_sleep") }}</li>
        </ul>

        <h3>{{ $t("connection_lost_help_what_to_do") }}</h3>
        <ul>
          <li>{{ $t("connection_lost_help_todo_wait") }}</li>
          <li>{{ $t("connection_lost_help_todo_unsaved") }}</li>
          <li>{{ $t("connection_lost_help_todo_reload") }}</li>
        </ul>

        <p v-if="contactmail">
          {{ $t("if_issues_contact") }}
          <a :href="'mailto:' + contactmail" target="_blank">{{
            contactmail
          }}</a
          >.
        </p>
      </div>

      <!-- the floating notice is hidden while the modal is open (it would
        cover it on phones): same status + retry, docked in the footer -->
      <template slot="footer">
        <div class="_disconnectModal--pill" role="status">
          <span class="_disconnectModal--dot" aria-hidden="true" />
          <span class="_disconnectModal--label">
            {{ $t("connection_lost") }}
          </span>
          <button
            type="button"
            class="_disconnectModal--retry"
            :disabled="is_reconnecting"
            @click="reconnectSocket"
          >
            <span
              class="_disconnectModal--retryLabel"
              :class="{ 'is--hidden': is_reconnecting }"
            >
              {{ $t("retry") }}
              <span class="_disconnectModal--countdown">{{
                reconnecting_in
              }}</span>
            </span>
            <LoaderSpinner v-if="is_reconnecting" class="_spinner" />
          </button>
        </div>
      </template>
    </BaseModal2>
  </div>
</template>
<script>
// Short drops (phone locked, tab in background) reconnect on their own:
// only show the badge once we've been offline for a little while.
const SHOW_AFTER_MS = 3000;
// after this many failed retries, it's not a blip: explain the consequences
const PERSISTENT_AFTER_ATTEMPTS = 2;
// how long the green "connection back" confirmation stays
const RECONNECTED_DISPLAY_MS = 5000;

export default {
  props: {},
  components: {},
  data() {
    return {
      reconnecting_in: 4,
      subsequent_reconnection_delay: 9,

      is_reconnecting: false,
      is_visible: false,
      failed_attempts: 0,
      show_help_modal: false,
      is_reconnected: false,
    };
  },
  async created() {
    this.show_timer = setTimeout(() => {
      this.is_visible = true;
    }, SHOW_AFTER_MS);

    // try to reconnect first
    this.$api.reconnectSocket();
    await new Promise((r) => setTimeout(r, 1000));

    const tick = async () => {
      if (this.is_destroyed) return;
      if (this.reconnecting_in > 1) this.reconnecting_in--;
      else await this.reconnectSocket();
      if (!this.$api.connected)
        this.countdown_timer = window.setTimeout(tick, 1000);
    };
    tick();
  },
  mounted() {},
  beforeDestroy() {
    this.is_destroyed = true;
    clearTimeout(this.show_timer);
    clearTimeout(this.countdown_timer);
    clearTimeout(this.close_timer);
  },
  watch: {
    "$api.connected": function () {
      if (!this.$api.connected) return;
      // the badge was never shown (short drop): nothing to confirm
      if (!this.is_visible) return this.$emit("close");

      clearTimeout(this.countdown_timer);
      this.show_help_modal = false;
      this.is_reconnected = true;
      this.close_timer = setTimeout(
        () => this.$emit("close"),
        RECONNECTED_DISPLAY_MS
      );
    },
  },
  computed: {
    is_persistent() {
      return this.failed_attempts >= PERSISTENT_AFTER_ATTEMPTS;
    },
    contactmail() {
      return this.$root.app_infos.instance_meta.contactmail;
    },
  },
  methods: {
    async reconnectSocket() {
      this.is_reconnecting = true;
      this.$api.reconnectSocket();

      await new Promise((r) => setTimeout(r, 1000));
      this.is_reconnecting = false;
      if (!this.$api.connected) this.failed_attempts++;
      this.reconnecting_in = this.subsequent_reconnection_delay;
    },
  },
};
</script>
<style lang="scss" scoped>
._disconnectModal {
  position: fixed;
  // bottom-left holds the canvas minimap
  right: var(--fixed-ui-margins, 0.75rem);
  // pages with a fixed bottom bar (postcard) publish its height
  bottom: calc(
    var(--fixed-ui-margins, 0.75rem) +
      max(var(--fixed-bottom-bar-height, 0px), env(safe-area-inset-bottom, 0px))
  );
  // max 32-bit value: above modals, overlays and the paged viewer
  z-index: 2147483647;
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
  max-width: min(24rem, calc(100vw - 2 * var(--fixed-ui-margins, 0.75rem)));
  padding: calc(var(--spacing) / 3) calc(var(--spacing) / 3)
    calc(var(--spacing) / 1.5) var(--spacing);
  border-radius: 1rem;
  background: var(--c-rouge, #fc4b60);
  color: white;
  font-size: var(--sl-font-size-normal);
  font-weight: 600;
  line-height: 1.2;
  box-shadow: 0 4px 20px color-mix(in srgb, black 30%, transparent);
  animation: disconnectIn 0.3s ease-out,
    disconnectRing 2s ease-out 0.3s infinite;

  &.is--reconnected {
    padding: calc(var(--spacing) / 1.5) var(--spacing);
    background: var(--c-vert_fonce, hsl(143, 69%, 40%));
    animation: none;
  }
}

._disconnectModal--row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1.5);
}

._disconnectModal--pill {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) / 1.5);
  margin-left: auto;
  padding: calc(var(--spacing) / 3) calc(var(--spacing) / 3)
    calc(var(--spacing) / 3) var(--spacing);
  border-radius: 2rem;
  background: var(--c-rouge, #fc4b60);
  color: white;
  font-size: var(--sl-font-size-normal);
  font-weight: 600;
  line-height: 1.2;
}

._disconnectModal--dot {
  flex-shrink: 0;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: white;
  animation: disconnectPulse 1.2s ease-in-out infinite;
}

._disconnectModal--label {
  flex: 1 1 auto;
  white-space: nowrap;
}

._disconnectModal--countdown {
  // single digit (max 9s): fixed width so the badge doesn't jitter
  display: inline-block;
  width: 1ch;
  margin-left: 0.25em;
  font-variant-numeric: tabular-nums;
  text-align: center;
  opacity: 0.7;
}

._disconnectModal--retryLabel {
  white-space: nowrap;

  &.is--hidden {
    visibility: hidden;
  }
}

._disconnectModal--retry {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 4rem;
  min-height: 2rem;
  padding: 0 var(--spacing);
  border: none;
  border-radius: 2rem;
  background: white;
  color: var(--c-rouge_fonce, #cc334a);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: color-mix(in srgb, white 85%, transparent);
  }
  &:disabled {
    cursor: default;
  }
}

._disconnectModal--details {
  margin: 0;
  padding-right: calc(var(--spacing) / 1.5);
  font-size: var(--sl-font-size-small);
  font-weight: 400;
  line-height: 1.4;

  a,
  ._disconnectModal--more {
    color: inherit;
    font-weight: 600;
    text-decoration: underline;
  }
}

._disconnectModal--more {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:hover {
    text-decoration-thickness: 2px;
  }
}

._disconnectHelp {
  h3 {
    margin-top: var(--spacing);
  }
  ul {
    padding-left: var(--spacing);
  }
}

._spinner {
  // overlays the hidden label, centered
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: inline-block;
  width: 1rem;
  height: 1rem;
  background-color: transparent;

  ::v-deep ._spinner {
    width: 0.9rem;
    height: 0.9rem;
  }
}

@keyframes disconnectIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes disconnectPulse {
  50% {
    opacity: 0.35;
  }
}

// expanding halo so the badge catches the eye without moving content
@keyframes disconnectRing {
  0% {
    box-shadow: 0 4px 20px color-mix(in srgb, black 30%, transparent),
      0 0 0 0 color-mix(in srgb, var(--c-rouge, #fc4b60) 60%, transparent);
  }
  70%,
  100% {
    box-shadow: 0 4px 20px color-mix(in srgb, black 30%, transparent),
      0 0 0 12px color-mix(in srgb, var(--c-rouge, #fc4b60) 0%, transparent);
  }
}
</style>
