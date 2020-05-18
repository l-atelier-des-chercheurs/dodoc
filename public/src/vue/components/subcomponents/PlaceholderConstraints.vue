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
        />
        <label
          :for="`option_${id}_${option.key}`"
          :class="{ 'c-rouge': option.enabled }"
        >
          <img class="_picto" :src="option.picto" />
          <span
            >{{ $t(option.key) }}
            <template v-if="option.key === 'other'">
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
  props: {},
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
          key: "other",
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
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
