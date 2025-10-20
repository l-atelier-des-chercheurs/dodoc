<template>
  <div class="u-spacingBottom">
    <DLabel
      :str="$t('latest_version_available')"
      :instructions="$t('latest_version_available_instructions')"
    />
    <button
      type="button"
      class="u-button u-button_bleumarine u-button_small"
      v-if="!is_checking"
      @click="checkLatestVersion"
    >
      <b-icon icon="globe" />
      {{ $t("search") }}
    </button>
    <template v-else>
      <div v-if="latest_version_info.loading">{{ $t("loading") }}...</div>
      <div v-else-if="latest_version_info.error" class="u-warning">
        <span v-html="$t('check_out_dodocfr')"></span>
      </div>
      <div v-else-if="latest_version_info.version">
        <template v-if="isUpToDate">
          <b-icon icon="check-circle-fill" />
          {{ $t("up_to_date") }}
        </template>
        <template v-else-if="isNewerVersionAvailable">
          <b-icon icon="exclamation-triangle-fill" />&nbsp;
          <span
            v-html="
              $tc('update_available_go_to_dodocfr', null, {
                version: latest_version_info.version,
              })
            "
          ></span>
        </template>
        <template v-else>
          <b-icon icon="info-circle-fill" />&nbsp;
          {{
            $tc("running_newer_version", null, {
              version: latest_version_info.version,
            })
          }}
        </template>
      </div>
    </template>
  </div>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      is_checking: false,
      latest_version_info: {
        version: null,
        loading: false,
        error: false,
      },
      fetch_url:
        "https://latelier-des-chercheurs.fr/appversions/dodoc.json?lang=" +
        this.$i18n.locale,
    };
  },
  mounted() {
    this.is_checking = false;
  },
  computed: {
    current_version() {
      return this.$root.app_infos.version;
    },
    isUpToDate() {
      if (!this.latest_version_info.version) return false;
      return (
        this.compareSemver(
          this.current_version,
          this.latest_version_info.version
        ) === 0
      );
    },
    isNewerVersionAvailable() {
      if (!this.latest_version_info.version) return false;
      return (
        this.compareSemver(
          this.current_version,
          this.latest_version_info.version
        ) < 0
      );
    },
    isRunningNewerVersion() {
      if (!this.latest_version_info.version) return false;
      return (
        this.compareSemver(
          this.current_version,
          this.latest_version_info.version
        ) > 0
      );
    },
  },
  methods: {
    compareSemver(a, b) {
      const parse = (v) => v.split(".").map(Number);
      const [a1, a2, a3] = parse(a);
      const [b1, b2, b3] = parse(b);

      if (a1 !== b1) return a1 - b1;
      if (a2 !== b2) return a2 - b2;
      return a3 - b3;
    },
    async checkLatestVersion() {
      this.is_checking = true;
      this.latest_version_info.loading = true;
      this.latest_version_info.error = false;
      this.latest_version_info.version = null;

      try {
        const response = await fetch(this.fetch_url, {
          mode: "cors",
          cache: "no-cache",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.latest_version_info.version = data.latest_stable_version || "N/A";
      } catch (error) {
        console.error("Error fetching latest version:", error);
        this.latest_version_info.error = true;
      } finally {
        this.latest_version_info.loading = false;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
._error {
  color: var(--color-error, #d32f2f);
}
</style>
