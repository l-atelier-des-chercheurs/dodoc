<template>
  <div class="_fieldHistoryPanel">
    <button
      type="button"
      class="u-buttonLink _toggle"
      :aria-expanded="show_history ? 'true' : 'false'"
      @click="toggleHistory"
    >
      <b-icon icon="clock-history" />
      {{ $t("history") }}
      <b-icon :icon="show_history ? 'chevron-up' : 'chevron-down'" />
    </button>

    <transition name="fade_fast">
      <div v-if="show_history" class="_panel">
        <LoaderSpinner v-if="is_loading" />
        <p v-else-if="fetch_error" class="u-instructions">
          {{ $t("history_unavailable") }}
        </p>
        <p v-else-if="field_history.length === 0" class="u-instructions">
          {{ $t("no_history_yet") }}
        </p>
        <ul v-else class="_list">
          <li
            v-for="(entry, index) in field_history"
            :key="entry.ts + '-' + index"
            class="_entry"
            :class="{
              'is--current': isCurrent(entry),
            }"
          >
            <div class="_body">
              <div
                v-if="input_type === 'editor' && !isEmpty(entry.value)"
                class="_value"
                v-html="$sanitize(entry.value)"
              />
              <div v-else class="_value" v-text="formatValue(entry.value)" />
              <small class="_meta">
                <time :datetime="entry.ts" :title="entry.ts">
                  {{ formatDateTimeToPrecise(entry.ts) }}
                </time>
                <template v-if="entry.author_path">
                  • {{ formatAuthor(entry.author_path) }}
                </template>
                <template v-if="entry.event === 'created'">
                  • {{ $t("creation") }}
                </template>
              </small>
            </div>
            <span v-if="isCurrent(entry)" class="_currentTag">
              {{ $t("current_value") }}
            </span>
            <button
              v-else
              type="button"
              class="u-button u-button_icon u-button_small _restoreBtn"
              :title="$t('restore')"
              :aria-label="$t('restore')"
              @click="$emit('restore', entry.value)"
            >
              <b-icon icon="arrow-counterclockwise" />
            </button>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>
<script>
import { extract_field_entries } from "@/utils/field_history.js";

export default {
  props: {
    path: String,
    field_name: String,
    input_type: {
      type: String,
      default: "text",
    },
    current_value: [String, Number],
  },
  data() {
    return {
      show_history: false,
      is_loading: false,
      fetch_error: false,
      field_history: [],
    };
  },
  methods: {
    async toggleHistory() {
      this.show_history = !this.show_history;
      if (this.show_history) await this.fetchHistory();
    },
    async fetchHistory() {
      this.is_loading = true;
      this.fetch_error = false;
      try {
        const entries = await this.$api.getFieldHistory({ path: this.path });
        this.field_history = extract_field_entries(entries, this.field_name);
      } catch (err) {
        this.fetch_error = true;
        this.field_history = [];
      }
      this.is_loading = false;
    },
    isEmpty(value) {
      return value === null || value === undefined || value === "";
    },
    isCurrent(entry) {
      return String(entry.value ?? "") === String(this.current_value ?? "");
    },
    formatValue(value) {
      if (this.isEmpty(value)) return "—";
      return String(value);
    },
    formatAuthor(author_path) {
      const author = this.getAuthor(author_path);
      if (author?.name) return author.name;
      return author_path.split("/").pop();
    },
  },
};
</script>
<style lang="scss" scoped>
._fieldHistoryPanel {
  margin-top: calc(var(--spacing) / 2);
}

._toggle {
  color: var(--c-gris_fonce);
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: var(--c-noir);
  }
}

._panel {
  margin-top: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 2);
  background: var(--c-gris_clair);
  border-radius: var(--border-radius);
  max-height: 40vh;
  overflow-y: auto;

  > p {
    margin: 0;
  }
}

._list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) / 4);
}

._entry {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  background: white;
  border-radius: var(--border-radius);
  border-left: 2px solid var(--c-gris);

  &.is--current {
    border-left-color: var(--c-bleuvert);
  }
}

._body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

._value {
  // long words/URLs must wrap inside the flex row
  overflow-wrap: anywhere;
  white-space: break-spaces;
  max-height: 8em;
  overflow-y: auto;
  overscroll-behavior: contain;

  ::v-deep {
    p {
      margin: 0;
    }
    img,
    video,
    iframe {
      max-width: 100%;
      height: auto;
    }
  }
}

._meta {
  color: var(--c-gris_fonce);
}

._currentTag {
  flex: 0 0 auto;
  font-size: var(--sl-font-size-x-small);
  color: var(--c-bleuvert_fonce);
}

._restoreBtn {
  flex: 0 0 auto;
}
</style>
