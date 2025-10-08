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
        {{ latest_version_info.version }}
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
      fetch_url: "https://latelier-des-chercheurs.fr/appversions/dodoc.json",
    };
  },
  mounted() {
    this.is_checking = false;
  },

  methods: {
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
