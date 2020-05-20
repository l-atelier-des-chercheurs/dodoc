<template>
  <div class="m_placeholderConstraints">
    <div
      class="m_placeholderConstraints--item"
      :class="{ 'is--active': option.enabled }"
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
        <label :for="`option_${id}_${option.key}`"> </label>
      </span>
      <div class="_picto">
        <div class="">
          <img v-if="option.picto" :src="option.picto" />
        </div>
        <label
          >{{ $t(option.key) }}
          <template v-if="option.key === 'file'">
            (.docx, .PDF, .stl…)
          </template>
        </label>
      </div>

      <div
        class="_options"
        v-if="option.enabled && (option.advanced_text_options || option.amount)"
      >
        <label>{{ $t("settings") }}</label>
        <div v-if="option.key === 'text'" class="_advanced_text">
          <label
            class=""
            :for="`option_${id}_${option.key}_advtext`"
            @click.stop
          >
            <input
              :id="`option_${id}_${option.key}_advtext`"
              type="checkbox"
              v-model="option.advanced_text_options"
            />
            {{ $t("advanced_text_bloc") }}
          </label>
        </div>
        <div class="_amount" v-if="option.amount">
          <label>
            {{ $t("amount") }}
          </label>
          <select v-model="option.amount">
            <option value="unlimited">{{ $t("unlimited") }}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
      </div>
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
          advanced_text_options: false,
          amount: "unlimited",
        },
        {
          key: "photo",
          picto: "/images/i_icone-dodoc_image.svg",
          enabled: true,
          amount: "unlimited",
        },
        {
          key: "video",
          picto: "/images/i_icone-dodoc_video.svg",
          enabled: true,
          amount: "unlimited",
        },
        {
          key: "audio",
          picto: "/images/i_icone-dodoc_audio.svg",
          enabled: true,
          amount: "unlimited",
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
          if (this.available_modes.some((m) => m.mode_key === o.key)) {
            o.enabled = true;
            const item = this.available_modes.find((m) => m.mode_key === o.key);
            if (item.hasOwnProperty("advanced_text_options"))
              o.advanced_text_options = item.advanced_text_options === "true";
            if (item.hasOwnProperty("amount")) o.amount = item.amount;
          } else o.enabled = false;
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
            let val = { mode_key: o.key };
            if (o.key === "text")
              val.advanced_text_options = o.advanced_text_options;

            if (o.amount && o.amount !== "unlimited") val.amount = o.amount;

            return val;
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
