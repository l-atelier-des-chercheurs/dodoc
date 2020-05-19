<template>
  <div class="m_placeholderConstraints">
    <div
      class="m_placeholderConstraints--item"
      v-for="option in options"
      :key="option.key"
    >
      <span class="switch switch-xs">
        <input
          type="checkbox"
          class="switch"
          :id="`option_${id}_${option.key}`"
          v-model="option.enabled"
          :disabled="
            option.enabled && options.filter((o) => o.enabled).length === 1
          "
        />
        <label
          :disabled="
            option.enabled && options.filter((o) => o.enabled).length === 1
          "
          :for="`option_${id}_${option.key}`"
          :class="{ 'c-rouge': option.enabled }"
        >
          <div class="_picto">
            <img v-if="option.picto" :src="option.picto" />
          </div>
          <span
            >{{ $t(option.key) }}
            <template v-if="option.key === 'file'">
              (.docx, .PDF, .stl…)
            </template>
          </span>
        </label>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: { available_modes: Array },
  components: {},
  data() {
    return {
      options: [
        {
          key: "text",
          picto: "/images/i_text.svg",
          enabled: true,
        },
        {
          key: "photo",
          picto: "/images/i_icone-dodoc_image.svg",
          enabled: true,
        },
        {
          key: "video",
          picto: "/images/i_icone-dodoc_video.svg",
          enabled: true,
        },
        {
          key: "audio",
          picto: "/images/i_icone-dodoc_audio.svg",
          enabled: true,
        },
        {
          key: "file",
          picto: "",
          enabled: true,
        },
      ],

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5),
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    available_modes: {
      handler() {
        if (
          !this.available_modes ||
          !Array.isArray(this.available_modes) ||
          this.available_modes.length === 0
        ) {
          this.options.map((o) => (o.enabled = true));
          return;
        }

        this.options.map((o) => {
          if (this.available_modes.some((m) => m.mode_key === o.key))
            o.enabled = true;
          else o.enabled = false;
        });
      },
      deep: true,
      immediate: true,
    },
    options: {
      handler() {
        const enabled_modes = this.options
          .filter((o) => o.enabled)
          .map((o) => {
            return { mode_key: o.key };
          });
        this.$emit("updateField", enabled_modes);
      },
      deep: true,
    },
  },
  computed: {
    // available_modes() {
    //   return this.options
    //     .filter((o) => o.enabled)
    //     .map((o) => {
    //       mode_key: o.key;
    //     });
    // },
  },
  methods: {},
};
</script>
<style lang="scss" scoped></style>
