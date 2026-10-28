<template>
  <BaseModal2 :title="filename" :size="'full'" @close="$emit('close')">
    <div class="_logViewer">
      <div class="_toolbar">
        <input
          ref="search"
          type="search"
          class="_search"
          v-model="search"
          :placeholder="$t('search_in_log')"
        />

        <div class="_levels">
          <button
            v-for="level in level_counts"
            :key="level.value"
            type="button"
            class="_levelBtn"
            :data-level="level.value"
            :class="{ 'is--active': levels.includes(level.value) }"
            @click="toggle(levels, level.value)"
          >
            {{ $t("log_level_" + level.value) }}
            <span class="_count">{{ level.count }}</span>
          </button>
        </div>

        <select v-model="event_filter" class="_select">
          <option value="">{{ $t("all_events") }}</option>
          <option v-for="e in event_counts" :key="e.value" :value="e.value">
            {{ e.value }} ({{ e.count }})
          </option>
        </select>
        <select v-model="from_filter" class="_select">
          <option value="">{{ $t("all_origins") }}</option>
          <option v-for="f in from_counts" :key="f.value" :value="f.value">
            {{ f.value }} ({{ f.count }})
          </option>
        </select>

        <label v-if="is_running" class="_live">
          <input type="checkbox" v-model="follow_live" />
          {{ $t("follow_live") }}
        </label>
        <button
          type="button"
          class="u-button u-button_icon u-button_small"
          :title="$t('refresh_logs')"
          @click="loadLog"
        >
          <b-icon icon="arrow-clockwise" />
        </button>

        <small class="_total">
          {{ filtered_entries.length }} / {{ entries.length }}
        </small>
      </div>

      <div v-if="is_loading && entries.length === 0" class="_state">
        <LoaderSpinner />
      </div>
      <p v-else-if="error" class="_state u-warning">{{ error }}</p>
      <p v-else-if="filtered_entries.length === 0" class="_state">
        <small class="u-instructions">{{ $t("no_matching_entries") }}</small>
      </p>

      <ol v-else class="_entries">
        <li
          v-for="entry in shown_entries"
          :key="entry.line"
          class="_entry"
          :data-level="entry.level"
          :class="{ 'is--open': opened_lines.includes(entry.line) }"
        >
          <button type="button" class="_row" @click="toggle(opened_lines, entry.line)">
            <time
              class="_time"
              :datetime="entry.ts"
              :title="entry.ts && formatDateTimeToPrecise(entry.ts)"
            >
              {{ formatTime(entry.ts) }}
            </time>
            <span v-if="entry.from" class="_from">{{ entry.from }}</span>
            <span v-if="entry.event" class="_event">{{ entry.event }}</span>
            <span class="_message">
              {{ entry.message }}
              <span v-if="entry.details" class="_detailsSummary">
                {{ summarize(entry.details) }}
              </span>
            </span>
          </button>
          <div v-if="opened_lines.includes(entry.line)" class="_details">
            <div class="_detailsActions">
              <small>{{ $t("line") }} {{ entry.line }}</small>
              <button type="button" class="u-buttonLink" @click="copy(entry)">
                {{ $t("copy") }}
              </button>
            </div>
            <pre>{{ pretty(entry) }}</pre>
          </div>
        </li>
      </ol>

      <button
        v-if="filtered_entries.length > shown_count"
        type="button"
        class="u-button u-button_small _more"
        @click="shown_count += page_size"
      >
        {{ $t("show_more") }} ({{ filtered_entries.length - shown_count }})
      </button>
    </div>
  </BaseModal2>
</template>
<script>
import {
  parseLogLines,
  matchesFilters,
  countBy,
} from "@/utils/log_entries.js";

const LEVELS = ["error", "warning", "notice", "info"];

export default {
  props: {
    filename: String,
    end_status: String,
  },
  data() {
    return {
      entries: [],
      is_loading: false,
      error: "",

      search: "",
      levels: [],
      event_filter: "",
      from_filter: "",

      opened_lines: [],
      page_size: 300,
      shown_count: 300,

      follow_live: this.end_status === "running",
      live_interval: undefined,
    };
  },
  async mounted() {
    await this.loadLog();
    this.$nextTick(() => this.$refs.search?.focus());
  },
  beforeDestroy() {
    clearInterval(this.live_interval);
  },
  watch: {
    follow_live: {
      handler() {
        clearInterval(this.live_interval);
        if (this.follow_live && this.is_running)
          this.live_interval = setInterval(this.loadLog, 3000);
      },
      immediate: true,
    },
    filters() {
      this.shown_count = this.page_size;
    },
  },
  computed: {
    is_running() {
      return this.end_status === "running";
    },
    filters() {
      return {
        search: this.search.trim(),
        levels: this.levels,
        events: this.event_filter ? [this.event_filter] : [],
        froms: this.from_filter ? [this.from_filter] : [],
      };
    },
    filtered_entries() {
      return this.entries.filter((e) => matchesFilters(e, this.filters));
    },
    shown_entries() {
      return this.filtered_entries.slice(0, this.shown_count);
    },
    level_counts() {
      const counts = countBy(this.entries, "level");
      return LEVELS.map((value) => ({
        value,
        count: counts.find((c) => c.value === value)?.count || 0,
      })).filter((l) => l.count > 0);
    },
    event_counts() {
      return countBy(this.entries, "event");
    },
    from_counts() {
      return countBy(this.entries, "from");
    },
  },
  methods: {
    async loadLog() {
      if (this.is_loading) return;
      this.is_loading = true;
      try {
        const text = await this.$api.readLog({ filename: this.filename });
        this.entries = parseLogLines(text);
        this.error = "";
      } catch (err) {
        // a running session's file is renamed when it stops
        this.follow_live = false;
        this.error = this.$t("log_unavailable");
      }
      this.is_loading = false;
    },
    toggle(list, value) {
      const index = list.indexOf(value);
      if (index === -1) list.push(value);
      else list.splice(index, 1);
    },
    formatTime(ts) {
      if (!ts) return "—";
      const d = new Date(ts);
      return (
        d.toLocaleTimeString(this.$i18n.locale, { hour12: false }) +
        "." +
        String(d.getMilliseconds()).padStart(3, "0")
      );
    },
    summarize(details) {
      // one line preview, the full object is shown when the row is opened
      const text = JSON.stringify(details);
      return text.length > 160 ? text.slice(0, 160) + "…" : text;
    },
    pretty(entry) {
      if (entry.parse_error) return entry.raw;
      try {
        return JSON.stringify(JSON.parse(entry.raw), null, 2);
      } catch (e) {
        return entry.raw;
      }
    },
    async copy(entry) {
      try {
        await navigator.clipboard.writeText(this.pretty(entry));
        this.$alertify.delay(2000).success(this.$t("copied"));
      } catch (e) {
        this.$alertify.delay(2000).error(this.$t("failed_to_copy"));
      }
    },
  },
};
</script>
<style lang="scss" scoped>
._logViewer {
  --level-color: var(--c-gris);
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 2) 0;
  background: white;
  border-bottom: 1px solid var(--c-gris);
}

._search {
  flex: 1 1 200px;
  min-width: 0;
}

._select {
  flex: 0 1 auto;
  width: auto;
  max-width: 14rem;
}

._levels {
  display: flex;
  flex-flow: row wrap;
  gap: calc(var(--spacing) / 4);
}

._levelBtn {
  all: unset;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.15em 0.6em;
  border-radius: 1em;
  font-size: var(--sl-font-size-small);
  border: 1px solid var(--level-color);

  &.is--active {
    background: var(--level-color);
    color: white;
  }
  &:focus-visible {
    outline: 2px solid var(--c-bleuvert);
  }

  ._count {
    font-variant-numeric: tabular-nums;
    opacity: 0.75;
  }
}

[data-level="error"] {
  --level-color: var(--c-rouge);
}
[data-level="warning"] {
  --level-color: var(--c-orange, orange);
}
[data-level="notice"] {
  --level-color: var(--c-bleuvert);
}

._live {
  display: inline-flex;
  align-items: center;
  gap: 0.3em;
  font-size: var(--sl-font-size-small);
}

._total {
  margin-left: auto;
  color: var(--c-gris_fonce);
  font-variant-numeric: tabular-nums;
}

._state {
  padding: var(--spacing);
  text-align: center;
}

._entries {
  list-style: none;
  margin: 0;
  padding: 0;
  font-family: var(--sl-font-mono);
  font-size: var(--sl-font-size-x-small);
}

._entry {
  border-left: 3px solid var(--level-color);
  border-bottom: 1px solid var(--c-gris_clair);

  &[data-level="info"] {
    border-left-color: transparent;
  }
  &[data-level="error"] ._row {
    background: color-mix(in srgb, var(--c-rouge) 8%, transparent);
  }
}

._row {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  gap: calc(var(--spacing) / 2);
  width: 100%;
  padding: 0.2em calc(var(--spacing) / 2);

  &:hover {
    background: var(--c-gris_clair);
  }
  &:focus-visible {
    outline: 2px solid var(--c-bleuvert);
    outline-offset: -2px;
  }
}

._time {
  flex: 0 0 auto;
  color: var(--c-gris_fonce);
  font-variant-numeric: tabular-nums;
}

._from {
  flex: 0 0 auto;
  color: var(--c-bleuvert_fonce);
}

._event {
  flex: 0 0 auto;
  font-weight: 600;
  color: var(--level-color);

  [data-level="info"] & {
    color: inherit;
  }
}

._message {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

._detailsSummary {
  color: var(--c-gris_fonce);
}

._details {
  padding: 0 calc(var(--spacing) / 2) calc(var(--spacing) / 2);

  pre {
    margin: 0;
    padding: calc(var(--spacing) / 2);
    background: var(--c-gris_clair);
    border-radius: 2px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    max-height: 50vh;
    overflow: auto;
  }
}

._detailsActions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25em 0;
}

._more {
  align-self: center;
}
</style>
