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

  /* colors */
  --ri5-color-primary-hsl: 0, 0%, 10%;
  --ri5-color-contrast-high-hsl: 230, 7%, 23%;
  --ri5-color-contrast-higher-hsl: 230, 13%, 9%;
  --ri5-color-bg-darker-hsl: 255, 4%, 100%;
  --ri5-color-white-hsl: 0, 0%, 100%;

  --radio-switch-width: 276px;
  --radio-switch-height: 36px;
  --radio-switch-padding: 2px;
  --radio-switch-radius: 5px;
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
  // gap: 2px;
  border-radius: calc(var(--radio-switch-radius) * 1.4);
  transition: all var(--radio-switch-animation-duration);
  overflow: hidden;
  background-color: var(--c-bodybg);
  border: 2px solid var(--c-bodybg);
}

.radio-switch:hover {
  border-color: var(--c-bodybg);
  // background-color: var(--c-gris);
}
// .radio-switch:focus-within {
//   border-color: var(--active-color);
// }

.radio-switch__item {
  position: relative;
  display: inline-block;
  // height: calc(var(--radio-switch-height) - 2 * var(--radio-switch-padding));
  // width: calc(var(--radio-switch-width) * 0.5 - var(--radio-switch-padding));

  // padding: calc(var(--spacing) / 4);
  // margin: -1px;

  .radio-switch__label {
    border-radius: 0;
  }

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
  // position: relative;
  // z-index: 2;
  // display: flex;
  // height: 100%;
  // align-items: center;
  // justify-content: center;
  // border-radius: var(--radio-switch-radius);
  // color: var(--c-noir);
  // cursor: pointer;
  // -webkit-user-select: none;
  // -moz-user-select: none;
  // -ms-user-select: none;
  // user-select: none;

  // font-weight: 500;

  transition: all var(--radio-switch-animation-duration);

  &:hover,
  &:focus-visible {
    // background-color: var(--active-color);
  }
}
.radio-switch__input:checked ~ .radio-switch__label {
  // color: hsl(var(--ri5-color-white-hsl));
  // background-color: var(--c-noir);
  // pointer-events: none;
  // pointer-events: none;
}
.radio-switch__input:focus ~ .radio-switch__label {
  // background-color: hsla(var(--ri5-color-primary-hsl), 0.6);
}
.radio-switch__label :not(*):focus-within,
.radio-switch__input:focus ~ .radio-switch__label {
}

.radio-switch__marker {
  position: absolute;
  inset: 3px;
  // background-color: var(--active-color);
  // background-color: var(--c-noir);
  border-radius: var(--radio-switch-radius);
}

// .radio-switch__marker {
//   position: absolute;
//   z-index: 1;
//   top: 0;
//   left: -100%;
//   border-radius: var(--radio-switch-radius);
//   background-color: hsl(var(--ri5-color-primary-hsl));
//   height: calc(var(--radio-switch-height) - 2 * var(--radio-switch-padding));
//   width: calc(var(--radio-switch-width) * 0.5 - var(--radio-switch-padding));
//   // box-shadow: 0 0.9px 1.5px rgba(0, 0, 0, 0.03),
//   //   0 3.1px 5.5px rgba(0, 0, 0, 0.08), 0 14px 25px rgba(0, 0, 0, 0.12);
//   transition: -webkit-transform var(--radio-switch-animation-duration);
//   transition: transform var(--radio-switch-animation-duration);
//   transition: transform var(--radio-switch-animation-duration),
//     -webkit-transform var(--radio-switch-animation-duration);
// }
// .radio-switch__input:checked ~ .radio-switch__marker {
//   -webkit-transform: translateX(100%);
//   transform: translateX(100%);
// }

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
