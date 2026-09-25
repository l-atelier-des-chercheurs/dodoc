<template>
  <div class="_radioSwitch">
    <ul class="radio-switch">
      <li
        class="radio-switch__item"
        v-for="option in options"
        :key="option.value"
      >
        <input
          class="radio-switch__input ri5-sr-only"
          type="radio"
          :name="id"
          :id="id + '_' + option.value"
          :value="option.value"
          :checked="content === option.value"
          @input="(event) => $emit('update:content', option.value)"
        />
        <label
          class="u-button radio-switch__label"
          :class="{
            'is--active': content === option.value,
          }"
          :for="id + '_' + option.value"
        >
          {{ option.label }}
        </label>
        <transition name="popUp_slow">
          <div
            aria-hidden="true"
            v-if="content === option.value"
            class="radio-switch__marker"
          />
        </transition>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  props: {
    content: String,
    options: Array,
  },
  components: {},
  data() {
    return {
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
<style lang="scss" scoped>
._radioSwitch {
  display: flex;
  justify-content: center;

  --radio-switch-radius: 5px;
  --radio-switch-animation-duration: 0.3s;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.radio-switch {
  position: relative;
  display: flex;
  gap: 4px;
  border-radius: calc(var(--radio-switch-radius) * 1.4);
  transition: all var(--radio-switch-animation-duration);
  overflow: hidden;
  background-color: var(--c-gris_clair);
  padding: 4px;

  &:hover {
    // border-color: var(--c-bodybg);
  }
}

.radio-switch__item {
  position: relative;
  display: inline-block;

  &:first-child {
    .radio-switch__label {
      border-top-left-radius: var(--radio-switch-radius);
      border-bottom-left-radius: var(--radio-switch-radius);
    }
  }
  &:last-child {
    .radio-switch__label {
      border-top-right-radius: var(--radio-switch-radius);
      border-bottom-right-radius: var(--radio-switch-radius);
    }
  }
}

.radio-switch__label {
  transition: all var(--radio-switch-animation-duration);
}

.radio-switch__marker {
  position: absolute;
  inset: 4px;
  border-radius: var(--radio-switch-radius);
}

/* utility classes */
.ri5-sr-only {
  position: absolute;
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  overflow: hidden;
  padding: 0;
  border: 0;
  white-space: nowrap;
}
</style>
