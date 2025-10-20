<template>
  <div class="_fileInfos">
    <div>
      <DLabel :str="$t('size')" />
      <div class="_comp">
        <span>
          <template v-if="original_file.$infos && original_file.$infos.size">
            {{ formatBytes(original_file.$infos.size) }}
          </template>
          <template v-else> ? </template>
        </span>
        <b-icon icon="arrow-right-circle" />
        <strong>
          <template v-if="optimized_file.$infos && optimized_file.$infos.size">
            {{ formatBytes(optimized_file.$infos.size) }}
          </template>
          <template v-else> ? </template>
        </strong>
      </div>
    </div>

    <div
      v-if="
        optimized_file.$type === 'image' || optimized_file.$type === 'video'
      "
    >
      <DLabel :str="$t('resolution')" />
      <div class="_comp">
        <span>
          <template
            v-if="
              original_file.$infos &&
              original_file.$infos.width &&
              original_file.$infos.height
            "
          >
            {{
              original_file.$infos.width + " × " + original_file.$infos.height
            }}
          </template>
          <template v-else> ? </template>
        </span>
        <b-icon icon="arrow-right-circle" />
        <strong>
          <template
            v-if="
              optimized_file.$infos &&
              optimized_file.$infos.width &&
              optimized_file.$infos.height
            "
          >
            {{
              optimized_file.$infos.width + " × " + optimized_file.$infos.height
            }}
          </template>
          <template v-else> ? </template>
        </strong>
      </div>
    </div>

    <div v-if="optimized_file.$infos?.duration">
      <DLabel :str="$t('duration')" />
      <div class="_comp">
        <span>
          <template v-if="original_file.$infos?.duration">
            {{
              formatDurationToHoursMinutesSecondsDeciseconds(
                original_file.$infos.duration
              )
            }}
          </template>
          <template v-else> ? </template>
        </span>
        <b-icon icon="arrow-right-circle" />
        <strong>
          {{
            formatDurationToHoursMinutesSecondsDeciseconds(
              optimized_file.$infos.duration
            )
          }}
        </strong>
      </div>
    </div>

    <div>
      <DLabel :str="$t('filename')" />
      <div class="_comp">
        <span>
          {{ original_file.$media_filename }}
        </span>
        <b-icon icon="arrow-right-circle" />
        <strong>
          {{ optimized_file.$media_filename }}
        </strong>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    original_file: Object,
    optimized_file: Object,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
._fileInfos {
  display: flex;
  flex-flow: column nowrap;
  gap: calc(var(--spacing) / 2);
}

._comp {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
</style>
