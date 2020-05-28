<template>
  <div class="m_placeholderConstraints">
    <div class="m_placeholderConstraints--typeSelector">
      <input
        type="radio"
        class="custom_radio"
        :disabled="read_only"
        v-model="type_of_content"
        :id="`${id}_type_medias`"
        value="medias"
      />
      <label :for="`${id}_type_medias`">
        <span>{{ $t("text_and_medias") }}</span>
      </label>
      <input
        type="radio"
        class="custom_radio"
        :disabled="read_only"
        v-model="type_of_content"
        :id="`${id}_type_choices`"
        value="choices"
      />
      <label :for="`${id}_type_choices`">
        <span>{{ $t("choices") }}</span>
      </label>
    </div>
    <div
      class="m_placeholderConstraints--medias"
      v-if="type_of_content === 'medias'"
    >
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
            :disabled="read_only"
            :id="`option_${id}_${option.key}`"
            v-model="option.enabled"
          />
          <label :for="`option_${id}_${option.key}`"></label>
        </span>
        <button
          type="button"
          class="_picto button-nostyle"
          :disabled="read_only"
          @click="option.enabled = !option.enabled"
        >
          <div class>
            <img v-if="option.picto" :src="option.picto" />
          </div>
          <label>{{ $t(option.key) }}</label>
          <div>
            <small class v-if="option.key === 'file'"
              >(.docx, .PDF, .stl…)</small
            >
          </div>
        </button>

        <div
          class="_options"
          v-if="
            option.enabled &&
            (option.advanced_text_options ||
              option.only_numbers ||
              option.amount)
          "
        >
          <!-- <label>{{ $t("settings") }}</label> -->
          <div v-if="option.key === 'text'" class="_advanced_text">
            <label
              class
              :for="`option_${id}_${option.key}_advtext`"
              @click.stop
            >
              <input
                :id="`option_${id}_${option.key}_advtext`"
                :disabled="read_only"
                type="checkbox"
                v-model="option.advanced_text_options"
              />
              {{ $t("advanced_text_bloc") }}
            </label>
          </div>
          <div v-if="option.key === 'text'" class="_advanced_text">
            <label
              class
              :for="`option_${id}_${option.key}_only_numbers`"
              @click.stop
            >
              <input
                :id="`option_${id}_${option.key}_only_numbers`"
                type="checkbox"
                :disabled="read_only"
                v-model="option.only_numbers"
              />
              {{ $t("only_numbers") }}
            </label>
          </div>
          <div class="_amount" v-if="option.amount">
            <label>{{ $t("amount") }}</label>
            <select
              v-model="option.amount"
              class="select-xs"
              :disabled="read_only"
            >
              <option value="unlimited">{{ $t("unlimited") }}</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    <div
      class="m_placeholderConstraints--choices"
      v-else-if="type_of_content === 'choices'"
    >
      <div class="m_placeholderConstraints--choices--multiple">
        <label class :for="`enable_multiple_${id}`">
          <input
            :id="`enable_multiple_${id}`"
            type="checkbox"
            :disabled="read_only"
            v-model="options.find((o) => o.key === 'choices').multiple"
          />
          {{ $t("multiple_choices_possible") }}
        </label>
      </div>
      <!-- {{ options.find(o => o.key === 'choices').mutiple }} -->
      <div class="m_placeholderConstraints--choices--allChoices">
        <div v-for="choice in splitted_choices" :key="choice" class="m_choice">
          <template
            v-if="options.find((o) => o.key === 'choices').multiple === true"
          >
            <label class :for="'_choice_' + choice">
              <input :id="'_choice_' + choice" :type="'checkbox'" disabled />
              {{ choice }}
            </label>
          </template>

          <template v-else>
            <input
              class="custom_radio"
              disabled
              type="radio"
              :id="`_choice_${id}-${choice}`"
              :name="`${id}_multiple_choices_radio`"
            />
            <label class :for="`_choice_${id}-${choice}`">
              <span>{{ choice }}</span>
            </label>
          </template>

          <button
            type="button"
            class="buttonLink"
            v-if="edit_choice_mode"
            @click="removeChoice(choice)"
          >
            {{ $t("remove") }}
          </button>
        </div>
      </div>

      <div class="m_placeholderConstraints--choices--editor">
        <div>
          <button
            type="button"
            class="m_placeholderConstraints--choices--toggleEditMode buttonLink"
            :class="{ 'is--active': edit_choice_mode }"
            @click="edit_choice_mode = !edit_choice_mode"
          >
            {{ $t("add") }}/{{ $t("edit") }}
          </button>
        </div>
        <div>
          <form
            @submit.prevent="addChoice"
            class="m_placeholderConstraints--choices--addChoice"
            v-if="edit_choice_mode"
          >
            <input type="text" required autofocus />

            <div class="flex-nowrap flex-space-between">
              <button
                type="button"
                class="button-redthin"
                @click="edit_choice_mode = false"
              >
                {{ $t("cancel") }}
              </button>
              <button type="submit" class="button-greenthin">
                {{ $t("add") }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- <pre>{{ options }}</pre> -->
  </div>
</template>
<script>
export default {
  props: { available_modes: [String, Array], read_only: Boolean },
  components: {},
  data() {
    return {
      type_of_content: "medias",
      edit_choice_mode: false,

      options: [
        {
          key: "text",
          picto: "/images/i_text.svg",
          enabled: false,
          advanced_text_options: false,
          only_numbers: false,
          amount: "unlimited",
        },
        {
          key: "photo",
          picto: "/images/i_icone-dodoc_image.svg",
          enabled: false,
          amount: "unlimited",
        },
        {
          key: "video",
          picto: "/images/i_icone-dodoc_video.svg",
          enabled: false,
          amount: "unlimited",
        },
        {
          key: "audio",
          picto: "/images/i_icone-dodoc_audio.svg",
          enabled: false,
          amount: "unlimited",
        },
        {
          key: "file",
          picto: "",
          enabled: false,
        },
        {
          key: "choices",
          // picto: "/images/i_text.svg",
          choices: "",
          multiple: false,
          enabled: false,
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
        if (this.$root.state.dev_mode === "debug")
          console.log(`PlaceholderConstraints • WATCH: available_modes`);

        if (!this.available_modes || !Array.isArray(this.available_modes)) {
          // this.options.map(o =>
          //   o.mode_key !== "choices" ? (o.enabled = true) : ""
          // );
          return;
        }

        this.options.map((o) => {
          if (this.available_modes.some((m) => m.mode_key === o.key)) {
            o.enabled = true;
            const item = this.available_modes.find((m) => m.mode_key === o.key);
            if (item.hasOwnProperty("advanced_text_options"))
              o.advanced_text_options = item.advanced_text_options === "true";
            if (item.hasOwnProperty("only_numbers"))
              o.only_numbers = item.only_numbers === "true";
            if (item.hasOwnProperty("amount")) o.amount = item.amount;
            if (item.hasOwnProperty("choices")) o.choices = item.choices;
            if (item.hasOwnProperty("multiple"))
              o.multiple = item.multiple === "true";
          } else o.enabled = false;
        });

        if (this.options.find((o) => o.key === "choices" && o.enabled))
          this.type_of_content = "choices";
        else this.type_of_content = "medias";
      },
      deep: true,
      immediate: true,
    },
    edit_choice_mode() {
      if (this.edit_choice_mode) {
        this.$nextTick(() => {
          this.$el.querySelector("[autofocus]").focus();
        });
      }
    },
    options: {
      handler() {
        if (this.$root.state.dev_mode === "debug")
          console.log(`PlaceholderConstraints • WATCH: options`);

        let enabled_modes = this.options
          .filter((o) => o.enabled)
          .map((o) => {
            let val = { mode_key: o.key };
            if (o.key === "text") {
              val.advanced_text_options = o.advanced_text_options;
              val.only_numbers = o.only_numbers;
            }

            if (o.amount && o.amount !== "unlimited") val.amount = o.amount;

            if (o.choices) val.choices = o.choices;
            if (o.multiple) val.multiple = o.multiple;

            return val;
          });

        // // if choices is checked, remove all else
        // if (enabled_modes.find(m => m.mode_key === "choices")) {
        //   enabled_modes = enabled_modes.filter(m => m.mode_key === "choices");
        // }

        this.$emit("updateField", enabled_modes);
      },
      deep: true,
    },
    type_of_content() {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PlaceholderConstraints • WATCH: type_of_content`);

      if (this.type_of_content === "choices") {
        this.options.map((o) =>
          o.key !== "choices" ? (o.enabled = false) : (o.enabled = true)
        );
        if (
          this.options.find((o) => o.key === "choices").choices.length === 0
        ) {
          this.edit_choice_mode = true;
        }
      } else this.options.find((o) => o.key === "choices").enabled = false;
    },
  },
  computed: {
    splitted_choices() {
      return this.options.find((o) => o.key === "choices").choices !== ""
        ? this.options
            .find((o) => o.key === "choices")
            .choices.split("|")
            .filter((c) => c !== "")
        : [];
    },
  },
  methods: {
    addChoice($event) {
      if (this.$root.state.dev_mode === "debug")
        console.log(`PlaceholderConstraints • METHODS: addChoice`);

      if (
        !$event.target ||
        !$event.target.elements ||
        !$event.target.elements[0].value
      )
        return false;

      const new_choice = $event.target.elements[0].value;

      const existing_choices = this.splitted_choices;
      if (existing_choices.includes(new_choice)) {
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t("notifications.option_already_exists"));
        return false;
      }

      existing_choices.push(new_choice);

      this.options.find(
        (o) => o.key === "choices"
      ).choices = existing_choices.join("|");

      // this.edit_choice_mode = false;
      $event.target.elements[0].value = "";
    },
    removeChoice(choice) {
      const new_choices = this.splitted_choices.filter((c) => c !== choice);

      this.options.find((o) => o.key === "choices").choices = new_choices.join(
        "|"
      );
    },
  },
};
</script>
<style lang="scss" scoped></style>
