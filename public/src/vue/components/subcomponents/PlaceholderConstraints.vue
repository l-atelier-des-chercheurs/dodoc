<template>
  <div class="m_placeholderConstraints">
    <div class="m_placeholderConstraints--typeSelector">
      <label>
        <input type="radio" v-model="type_of_content" value="medias" />
        <span>{{ $t('medias') }}</span>
      </label>
      <label>
        <input type="radio" v-model="type_of_content" value="choices" />
        <span>{{ $t('choices') }}</span>
      </label>
    </div>
    <div class="m_placeholderConstraints--medias" v-if="type_of_content === 'medias'">
      <div
        class="m_placeholderConstraints--medias--item"
        :class="{ 'is--active': option.enabled }"
        v-for="option in options"
        v-if="option.key !== 'choices'"
        :key="option.key"
      >
        <span class="switch switch-xs">
          <input
            type="checkbox"
            class="switch"
            :id="`option_${id}_${option.key}`"
            v-model="option.enabled"
          />
          <label :for="`option_${id}_${option.key}`"></label>
        </span>
        <button
          type="button"
          class="_picto button-nostyle"
          @click="option.enabled = !option.enabled"
        >
          <div class>
            <img v-if="option.picto" :src="option.picto" />
          </div>
          <label>{{ $t(option.key) }}</label>
          <div>
            <small class v-if="option.key === 'file'">(.docx, .PDF, .stl…)</small>
          </div>
        </button>

        <div
          class="_options"
          v-if="option.enabled && (option.advanced_text_options || option.amount)"
        >
          <!-- <label>{{ $t("settings") }}</label> -->
          <div v-if="option.key === 'text'" class="_advanced_text">
            <label class :for="`option_${id}_${option.key}_advtext`" @click.stop>
              <input
                :id="`option_${id}_${option.key}_advtext`"
                type="checkbox"
                v-model="option.advanced_text_options"
              />
              {{ $t("advanced_text_bloc") }}
            </label>
          </div>
          <div class="_amount" v-if="option.amount">
            <label>{{ $t("amount") }}</label>
            <select v-model="option.amount" class="select-xs">
              <option value="unlimited">{{ $t("unlimited") }}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div class="m_placeholderConstraints--choices" v-else-if="type_of_content === 'choices'">
      <div v-for="choice in choices.split('|')" :key="choice">{{ choice.option }}</div>
      <form @submit.prevent="addChoiceOption">
        <input type="text" required />
        <button type="submit">{{ $t('add')}}</button>
      </form>
    </div>

    <pre>      {{ options }}</pre>
  </div>
</template>
<script>
export default {
  props: { available_modes: Array },
  components: {},
  data() {
    return {
      type_of_content: "medias",

      options: [
        {
          key: "text",
          picto: "/images/i_text.svg",
          enabled: true,
          advanced_text_options: false,
          amount: "unlimited"
        },
        {
          key: "photo",
          picto: "/images/i_icone-dodoc_image.svg",
          enabled: true,
          amount: "unlimited"
        },
        {
          key: "video",
          picto: "/images/i_icone-dodoc_video.svg",
          enabled: true,
          amount: "unlimited"
        },
        {
          key: "audio",
          picto: "/images/i_icone-dodoc_audio.svg",
          enabled: true,
          amount: "unlimited"
        },
        {
          key: "file",
          picto: "",
          enabled: true
        },
        {
          key: "choices",
          // picto: "/images/i_text.svg",
          choices: [],
          enabled: false
        }
      ],

      id: (Math.random().toString(36) + "00000000000000000").slice(2, 3 + 5)
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    available_modes: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`PlaceholderConstraints • WATCH: available_modes`);

        if (!this.available_modes || !Array.isArray(this.available_modes)) {
          // this.options.map(o =>
          //   o.mode_key !== "choices" ? (o.enabled = true) : ""
          // );
          return;
        }

        debugger;

        this.options.map(o => {
          if (this.available_modes.some(m => m.mode_key === o.key)) {
            o.enabled = true;
            const item = this.available_modes.find(m => m.mode_key === o.key);
            if (item.hasOwnProperty("advanced_text_options"))
              o.advanced_text_options = item.advanced_text_options === "true";
            if (item.hasOwnProperty("amount")) o.amount = item.amount;
            if (item.hasOwnProperty("choices"))
              o.choices = item.choices.split("|");
          } else o.enabled = false;
        });

        if (this.options.find(o => o.key === "choices" && o.enabled))
          this.type_of_content = "choices";
        else this.type_of_content = "medias";
      },
      deep: true,
      immediate: true
    },
    options: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`PlaceholderConstraints • WATCH: options`);

        let enabled_modes = this.options
          .filter(o => o.enabled)
          .map(o => {
            let val = { mode_key: o.key };
            if (o.key === "text")
              val.advanced_text_options = o.advanced_text_options;

            if (o.amount && o.amount !== "unlimited") val.amount = o.amount;

            if (o.choices) val.choices = o.choices.join("|");

            return val;
          });

        // // if choices is checked, remove all else
        // if (enabled_modes.find(m => m.mode_key === "choices")) {
        //   enabled_modes = enabled_modes.filter(m => m.mode_key === "choices");
        // }

        this.$emit("updateField", enabled_modes);
      },
      deep: true
    },
    type_of_content() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PlaceholderConstraints • WATCH: type_of_content`);

      if (this.type_of_content === "choices")
        this.options.map(o =>
          o.key !== "choices" ? (o.enabled = false) : (o.enabled = true)
        );
      else this.options.find(o => o.key === "choices").enabled = false;
    }
  },
  computed: {
    choices() {}
    // available_modes() {
    //   return this.options
    //     .filter((o) => o.enabled)
    //     .map((o) => {
    //       mode_key: o.key;
    //     });
    // },
  },
  methods: {
    addChoiceOption($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PlaceholderConstraints • METHODS: addChoiceOption`);

      if (
        !$event.target ||
        !$event.target.elements ||
        !$event.target.elements[0].value
      )
        return false;

      const new_choice = $event.target.elements[0].value;

      const existing_choices = this.options.find(o => o.key === "choices")
        .choices;

      if (existing_choices.includes(new_choice)) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.option_already_exists"));
        return false;
      }

      existing_choices.push(new_choice);
    }
  }
};
</script>
<style lang="scss" scoped></style>
