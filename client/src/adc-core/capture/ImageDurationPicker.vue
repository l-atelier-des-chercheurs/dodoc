<template>
  <BaseModal2 :title="$t('duration')" @close="$emit('close')">
    <div class="u-inputGroup u-spacingBottom">
      <input
        type="number"
        :name="$t('duration')"
        :id="'_input_' + $t('duration')"
        :size="'medium'"
        class="_input"
        :min="1"
        :max="3600"
        :step="1"
        v-model.number="local_value"
        @keyup.enter="$emit('save', local_value)"
      />
      <span class="u-suffix">
        {{ (local_value > 1 ? $t("images") : $t("image")).toLowerCase() }}
      </span>
    </div>

    <p class="u-instructions">
      {{
        $t("duration_explanation", {
          seconds_equivalent: seconds_equivalent,
          frame_rate: frame_rate,
        })
      }}
    </p>

    <div class="u-spacingBottom"></div>

    <template slot="footer">
      <SaveCancelButtons
        class="_scb"
        :allow_save="true"
        @save="$emit('save', local_value)"
        @cancel="$emit('close')"
      />
    </template>
  </BaseModal2>
</template>
<script>
export default {
  props: {
    value: Number,
    frame_rate: Number,
  },
  components: {},
  data() {
    return {
      local_value: this.value,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    seconds_equivalent() {
      return parseFloat(
        (this.local_value / this.frame_rate).toFixed(2)
      ).toLocaleString(this.$i18n.locale);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
input[type="number"] {
  max-width: 18ch;
}
</style>
