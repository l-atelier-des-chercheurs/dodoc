<template>
  <div class="_radioSwitch">
    <ul class="radio-switch">
      <li class="radio-switch__item" v-for="i in [0, 1]" :key="i">
        <input
          class="radio-switch__input ri5-sr-only"
          type="radio"
          :name="id"
          :id="id + '_' + i"
          :value="options[i].value"
          :checked="content === options[i].value"
          @input="(event) => $emit('update:content', event.target.value)"
        />
        <label class="radio-switch__label" :for="id + '_' + i">
          {{ options[i].label }}
        </label>
        <div
          v-if="i === 1"
          aria-hidden="true"
          class="radio-switch__marker"
        ></div>
      </li>
      <!-- <li class="radio-switch__item">
        <input
          class="radio-switch__input ri5-sr-only"
          type="radio"
          name="radio-switch-name"
          id="radio-2"
          :value="options[1].value"
          :checked="content === options[1].value"
          @input="(event) => $emit('update:content', event.target.value)"
        />
        <label class="radio-switch__label" for="radio-2">
          {{ options[1].label }}
        </label>
        <div aria-hidden="true" class="radio-switch__marker"></div>
      </li> -->
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
/* --------------------------------

File#: _1_radio-switch
Title: Radio Switch
Descr: Custom radio toggle
Usage: codyhouse.co/license

-------------------------------- */

._radioSwitch {
  display: flex;
  justify-content: center;

  /* colors */
  --ri5-color-primary-hsl: 0, 0%, 10%;
  --ri5-color-contrast-high-hsl: 230, 7%, 23%;
  --ri5-color-contrast-higher-hsl: 230, 13%, 9%;
  --ri5-color-bg-darker-hsl: 255, 4%, 100%;
  --ri5-color-white-hsl: 0, 0%, 100%;

  --radio-switch-width: 276px;
  --radio-switch-height: 36px;
  --radio-switch-padding: 0px;
  --radio-switch-radius: 10em;
  --radio-switch-animation-duration: 0.3s;
}

ul,
menu {
  list-style: none;
  margin: 0;
}

/* icons */
.ri5-icon {
  height: var(--ri5-size, 1em);
  width: var(--ri5-size, 1em);
  display: inline-block;
  color: inherit;
  fill: currentColor;
  line-height: 1;
  flex-shrink: 0;
  max-width: initial;
}

.ri5-icon--xs {
  --ri5-size: 16px;
}

.radio-switch {
  position: relative;
  display: inline-block;
  display: inline-flex;
  padding: var(--radio-switch-padding);
  border-radius: calc(var(--radio-switch-radius) * 1.4);
  background-color: var(--c-gris_clair);
  border: 1px solid var(--c-gris);
}
.radio-switch:focus-within,
.radio-switch:active {
  // background: blue;
  // border-color: var(--active-color);
  // box-shadow: 0 0 0 2px hsla(var(--ri5-color-contrast-higher-hsl), 0.15);
}

.radio-switch__item {
  position: relative;
  display: inline-block;
  height: calc(var(--radio-switch-height) - 2 * var(--radio-switch-padding));
  width: calc(var(--radio-switch-width) * 0.5 - var(--radio-switch-padding));
  margin: -1px;
}

.radio-switch__label {
  position: relative;
  z-index: 2;
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  border-radius: var(--radio-switch-radius);
  color: var(--c-noir);
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  font-weight: 500;

  transition: all var(--radio-switch-animation-duration);
}
.radio-switch__input:checked ~ .radio-switch__label {
  color: hsl(var(--ri5-color-white-hsl));
}
.radio-switch__input:focus ~ .radio-switch__label {
  background-color: hsla(var(--ri5-color-primary-hsl), 0.6);
}
.radio-switch__label :not(*):focus-within,
.radio-switch__input:focus ~ .radio-switch__label {
  background-color: transparent;
}

.radio-switch__marker {
  position: absolute;
  z-index: 1;
  top: 0;
  left: -100%;
  border-radius: var(--radio-switch-radius);
  background-color: hsl(var(--ri5-color-primary-hsl));
  height: calc(var(--radio-switch-height) - 2 * var(--radio-switch-padding));
  width: calc(var(--radio-switch-width) * 0.5 - var(--radio-switch-padding));
  // box-shadow: 0 0.9px 1.5px rgba(0, 0, 0, 0.03),
  //   0 3.1px 5.5px rgba(0, 0, 0, 0.08), 0 14px 25px rgba(0, 0, 0, 0.12);
  transition: -webkit-transform var(--radio-switch-animation-duration);
  transition: transform var(--radio-switch-animation-duration);
  transition: transform var(--radio-switch-animation-duration),
    -webkit-transform var(--radio-switch-animation-duration);
}
.radio-switch__input:checked ~ .radio-switch__marker {
  -webkit-transform: translateX(100%);
  transform: translateX(100%);
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
