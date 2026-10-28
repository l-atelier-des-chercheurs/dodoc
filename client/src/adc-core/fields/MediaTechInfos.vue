<template>
  <div class="_mediaTechInfos">
    <div class="u-metaField" v-if="video_summary">
      <DLabel :str="$t('video')" />
      <div>{{ video_summary }}</div>
    </div>
    <div class="u-metaField" v-if="audio_summary">
      <DLabel :str="$t('audio')" />
      <div>{{ audio_summary }}</div>
    </div>
    <div class="u-metaField" v-if="infos.bitrate">
      <DLabel :str="$t('bitrate')" />
      <div>{{ formatBitrate(infos.bitrate) }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    file: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    infos() {
      return this.file.$infos || {};
    },
    video_summary() {
      if (this.file.$type !== "video" || !this.infos.video_codec) return false;
      const parts = [this.infos.video_codec.toUpperCase()];
      if (this.infos.fps)
        parts.push(
          this.infos.fps.toLocaleString(this.$i18n.locale) +
            " " +
            this.$t("frames_per_second")
        );
      return parts.join(" · ");
    },
    audio_summary() {
      if (this.file.$type === "video" && this.infos.has_audio === false)
        return this.$t("no_sound");
      if (!this.infos.audio_codec) return false;
      const parts = [this.infos.audio_codec.toUpperCase()];
      const channels = this.infos.audio_channels;
      if (channels === 1) parts.push(this.$t("mono"));
      else if (channels === 2) parts.push(this.$t("stereo"));
      else if (channels) parts.push(this.$t("n_channels", { n: channels }));
      if (this.infos.audio_sample_rate)
        parts.push(
          (this.infos.audio_sample_rate / 1000).toLocaleString(
            this.$i18n.locale
          ) + " kHz"
        );
      return parts.join(" · ");
    },
  },
  methods: {
    formatBitrate(bps) {
      const kbps = bps / 1000;
      if (kbps < 1000) return `${Math.round(kbps)} kb/s`;
      return (
        (Math.round(kbps / 100) / 10).toLocaleString(this.$i18n.locale) +
        " Mb/s"
      );
    },
  },
};
</script>
<style lang="scss" scoped>
._mediaTechInfos {
  display: contents;
}
</style>
