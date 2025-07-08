<template>
  <div>
    <div class="u-instructions">
      {{ $t("logs_panel_instructions") }}
    </div>

    <div class="u-spacingBottom" />

    <DLabel :str="$t('available_logs')" />

    <div v-if="is_loading" class="u-spacingBottom">
      <LoaderSpinner />
    </div>

    <div v-else-if="logs.length === 0" class="u-spacingBottom">
      <div class="u-instructions">
        {{ $t("no_logs_available") }}
      </div>
    </div>

    <div v-else class="u-spacingBottom">
      <ol class="_logsList">
        <li
          v-for="(logInfo, index) in parsed_logs"
          :key="logInfo.filename"
          class="_logItem"
        >
          <div class="_logInfo">
            <div class="_logDates">
              <div class="_datesRow">
                <div>
                  <span>{{ $t("app_started_on") }}</span>
                  {{ logInfo.startDate }}
                </div>
                <div v-if="logInfo.endDate" class="">
                  <span>{{ $t("app_ended_on") }}</span>
                  {{ logInfo.endDate }}
                </div>
                <div v-if="index === 0" class="_logRunning">
                  {{ $t("session_running") }}
                </div>
                <div v-else-if="!logInfo.endDate" class="_logCrashed">
                  {{ $t("session_crashed") }}
                </div>
              </div>
            </div>
            <div class="_logDuration" v-if="logInfo.duration">
              <div>
                <span>{{ $t("duration") }}:</span>
                {{ logInfo.duration }}
              </div>
            </div>
          </div>
          <div class="_logActions">
            <a
              :href="logInfo.download_url"
              :download="logInfo.filename"
              target="_blank"
              class="u-buttonLink"
            >
              {{ $t("download") }}
            </a>
          </div>
        </li>
      </ol>
    </div>

    <div class="u-instructions">
      <button type="button" class="u-buttonLink" @click="refreshLogs">
        {{ $t("refresh_logs") }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "LogsPanel",
  props: {},
  data() {
    return {
      logs: [],
      is_loading: true,
    };
  },
  async mounted() {
    await this.loadLogs();
  },
  computed: {
    parsed_logs() {
      return this.logs
        .map((filename) => this.parseLogFilename(filename))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .reverse();
    },
  },
  methods: {
    parseLogFilename(filename) {
      // Remove .jsonl extension
      const nameWithoutExt = filename.replace(".jsonl", "");

      // Check if it has end timestamp (clean shutdown)
      const parts = nameWithoutExt.split("_until_");

      let startTimestamp, endTimestamp;

      if (parts.length >= 1) {
        // Parse start timestamp: "2025-07-08_17-49-21"
        const startParts = parts[0].split("_");
        if (startParts.length >= 2) {
          const datePart = startParts[0]; // "2025-07-08"
          const timePart = startParts[1].replace(/-/g, ":"); // "17-49-21" -> "17:49:21"
          startTimestamp = `${datePart}T${timePart}`;
        }

        // Parse end timestamp if present: "2025-07-08_17-50-21"
        if (parts.length >= 2) {
          const endParts = parts[1].split("_");
          if (endParts.length >= 2) {
            const endDatePart = endParts[0]; // "2025-07-08"
            const endTimePart = endParts[1].replace(/-/g, ":"); // "17-50-21" -> "17:50:21"
            endTimestamp = `${endDatePart}T${endTimePart}`;
          }
        }
      }

      const startDate = startTimestamp ? new Date(startTimestamp) : null;
      const endDate = endTimestamp ? new Date(endTimestamp) : null;

      let duration = null;
      if (startDate && endDate) {
        const diffMs = endDate - startDate;
        duration = this.formatDurationToHuman(diffMs / 1000);
      }

      return {
        filename,
        download_url: `/journal/${filename}`,
        startDate: startDate ? this.formatDate(startDate) : filename,
        endDate: endDate ? this.formatDate(endDate) : null,
        duration,
      };
    },
    formatDate(date) {
      return date.toLocaleString(this.$i18n.locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    async loadLogs() {
      try {
        this.is_loading = true;
        this.logs = await this.$api.getLogs();
      } catch (error) {
        console.error("Failed to load logs:", error);
        this.logs = [];
      } finally {
        this.is_loading = false;
      }
    },
    async refreshLogs() {
      await this.loadLogs();
    },
  },
};
</script>

<style lang="scss" scoped>
._logsList {
  --color-border: var(--c-gris);

  display: flex;
  flex-direction: column;
  gap: var(--spacing);

  padding-left: calc(var(--spacing) * 1.5);
}

._logItem {
  padding: calc(var(--spacing) / 2) var(--spacing);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-background-secondary);
}

._logDates {
  font-size: var(--font-size-small);
  color: var(--color-text);
}

._datesRow {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  gap: var(--spacing);
}

._logRunning {
  font-style: italic;
  font-weight: 500;
}
._logCrashed {
  color: var(--c-rouge);
}
</style>
