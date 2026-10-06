<template>
  <div>
    <!-- portal: escape any stacking context so it shows above everything -->
    <portal to="destination">
      <div
        v-if="is_reconnected"
        key="reconnected"
        class="_connectionStatus is--reconnected"
        role="status"
      >
        <div class="_connectionStatus--row">
          <b-icon icon="check-circle-fill" aria-hidden="true" />
          <span class="_connectionStatus--label">
            {{ $t("connection_back") }}
          </span>
        </div>
      </div>
      <div
        v-else-if="!$api.connected && is_visible && !show_help_modal"
        key="disconnected"
        class="_connectionStatus"
        role="status"
      >
        <div class="_connectionStatus--row">
          <span class="_connectionStatus--dot" aria-hidden="true" />
          <span class="_connectionStatus--label">
            {{ $t("connection_lost") }}
          </span>

          <button
            type="button"
            class="_connectionStatus--retry"
            :disabled="is_reconnecting"
            @click="reconnectSocket"
          >
            <!-- label stays in the flow (hidden) so the button never changes width -->
            <span
              class="_connectionStatus--retryLabel"
              :class="{ 'is--hidden': is_reconnecting }"
            >
              {{ $t("retry") }}
              <span class="_connectionStatus--countdown">{{
                reconnecting_in
              }}</span>
            </span>
            <LoaderSpinner v-if="is_reconnecting" class="_spinner" />
          </button>
        </div>

        <p class="_connectionStatus--details">
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
            class="_connectionStatus--more"
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
      <div class="_connectionHelp">
        <p
          class="_connectionHelp--lead"
          v-html="$t('connection_lost_help_intro', { app_name })"
        />

        <div class="_connectionHelp--warning">
          <b-icon icon="exclamation-triangle-fill" aria-hidden="true" />
          <p>
            <strong>{{ $t("changes_may_not_be_saved") }}</strong>
            {{ $t("connection_lost_help_live") }}
          </p>
        </div>

        <section>
          <h3>{{ $t("connection_lost_help_causes") }}</h3>
          <ul class="_connectionHelp--list">
            <li v-for="cause of causes" :key="cause.text">
              <span class="_connectionHelp--marker">
                <b-icon :icon="cause.icon" aria-hidden="true" />
              </span>
              <span v-html="$t(cause.text, { app_name })" />
            </li>
          </ul>
        </section>

        <section>
          <h3>{{ $t("connection_lost_help_what_to_do") }}</h3>
          <ol class="_connectionHelp--list is--steps">
            <li v-for="step of steps" :key="step">
              <span class="_connectionHelp--marker" aria-hidden="true" />
              <span v-html="$t(step, { app_name })" />
            </li>
          </ol>
        </section>

        <p v-if="contactmail" class="_connectionHelp--contact">
          <b-icon icon="envelope" aria-hidden="true" />
          <span>
            {{ $t("if_issues_contact") }}
            <a :href="'mailto:' + contactmail" target="_blank">{{
              contactmail
            }}</a
            >.
          </span>
        </p>
      </div>

      <!-- the floating notice is hidden while the modal is open (it would
        cover it on phones): same status + retry, docked in the footer -->
      <template slot="footer">
        <div class="_connectionStatus--pill" role="status">
          <span class="_connectionStatus--dot" aria-hidden="true" />
          <span class="_connectionStatus--label">
            {{ $t("connection_lost") }}
          </span>
          <button
            type="button"
            class="_connectionStatus--retry"
            :disabled="is_reconnecting"
            @click="reconnectSocket"
          >
            <span
              class="_connectionStatus--retryLabel"
              :class="{ 'is--hidden': is_reconnecting }"
            >
              {{ $t("retry") }}
              <span class="_connectionStatus--countdown">{{
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
    causes() {
      return [
        { icon: "globe", text: "connection_lost_help_cause_network" },
        { icon: "hdd", text: "connection_lost_help_cause_server" },
        { icon: "clock", text: "connection_lost_help_cause_sleep" },
      ];
    },
    steps() {
      return [
        "connection_lost_help_todo_wait",
        "connection_lost_help_todo_unsaved",
        "connection_lost_help_todo_reload",
      ];
    },
    is_persistent() {
      return this.failed_attempts >= PERSISTENT_AFTER_ATTEMPTS;
    },
    // shared by dodoc-based apps (slashdoc, living archive…): name the
    // software from its package.json productName, in bold
    app_name() {
      const name = this.$root.app_infos.product_name || "do•doc";
      return `${name}`;
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
._connectionStatus {
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
  animation: connectionStatusIn 0.3s ease-out,
    connectionStatusRing 2s ease-out 0.3s infinite;

  &.is--reconnected {
    padding: calc(var(--spacing) / 1.5) var(--spacing);
    background: var(--c-vert_fonce, hsl(143, 69%, 40%));
    animation: none;
  }
}

._connectionStatus--row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1.5);
}

._connectionStatus--pill {
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

._connectionStatus--dot {
  flex-shrink: 0;
  width: 0.65rem;
  height: 0.65rem;
  border-radius: 50%;
  background: white;
  animation: connectionStatusPulse 1.2s ease-in-out infinite;
}

._connectionStatus--label {
  flex: 1 1 auto;
  white-space: nowrap;
}

._connectionStatus--countdown {
  // single digit (max 9s): fixed width so the badge doesn't jitter
  display: inline-block;
  width: 1ch;
  margin-left: 0.25em;
  font-variant-numeric: tabular-nums;
  text-align: center;
  opacity: 0.7;
}

._connectionStatus--retryLabel {
  white-space: nowrap;

  &.is--hidden {
    visibility: hidden;
  }
}

._connectionStatus--retry {
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

._connectionStatus--details {
  margin: 0;
  padding-right: calc(var(--spacing) / 1.5);
  font-size: var(--sl-font-size-small);
  font-weight: 400;
  line-height: 1.4;

  a,
  ._connectionStatus--more {
    color: inherit;
    // font-weight: 600;
    text-decoration: underline;
  }
}

._connectionStatus--more {
  padding: 0;
  border: none;
  background: transparent;
  font: inherit;
  cursor: pointer;

  &:hover {
    text-decoration-thickness: 2px;
  }
}

._connectionHelp {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) * 1.25);
  padding-bottom: calc(var(--spacing) / 2);
  line-height: 1.45;

  p {
    margin: 0;
  }

  h3 {
    margin: 0 0 calc(var(--spacing) / 1.5);
    font-size: var(--sl-font-size-x-small);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--label-color);
  }
}

._connectionHelp--lead {
  font-size: var(--sl-font-size-medium, 1.1em);
}

._connectionHelp--warning {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) / 1.5);
  padding: calc(var(--spacing) / 1.5) var(--spacing);
  border-radius: var(--border-radius);
  background: color-mix(in srgb, var(--c-rouge) 10%, white);
  color: var(--c-rouge_fonce);

  svg {
    flex-shrink: 0;
    margin-top: 0.2em;
  }
}

._connectionHelp--list {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 1.5);
  margin: 0;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    gap: calc(var(--spacing) / 1.5);
  }

  &.is--steps {
    counter-reset: step;

    li {
      counter-increment: step;
    }
    ._connectionHelp--marker {
      background: var(--c-noir);
      color: white;
      font-size: var(--sl-font-size-x-small);
      font-weight: 600;

      &::before {
        content: counter(step);
      }
    }
  }
}

// round icon / step number in front of each line
._connectionHelp--marker {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--c-gris_clair);
}

._connectionHelp--contact {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1.5);
  padding: calc(var(--spacing) / 1.5) var(--spacing);
  border-radius: var(--border-radius);
  background: var(--c-gris_clair);
  font-size: var(--sl-font-size-small);

  svg {
    flex-shrink: 0;
  }
  a {
    font-weight: 600;
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

@keyframes connectionStatusIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@keyframes connectionStatusPulse {
  50% {
    opacity: 0.35;
  }
}

// expanding halo so the badge catches the eye without moving content
@keyframes connectionStatusRing {
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
