<template>
  <div class="_startsOnPagePicker" role="radiogroup">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      class="_option"
      role="radio"
      :class="{ 'is--active': option.key === current_key }"
      :aria-checked="option.key === current_key"
      :aria-label="option.text"
      :title="option.text"
      @click="$emit('select', option.key)"
    >
      <span class="_schema" :class="`is--${option.key || 'in_flow'}`">
        <span
          v-for="side in sidesFor(option.key)"
          :key="side.name"
          class="_page"
          :class="side.name"
        >
          <span
            v-for="(line, i) in side.lines"
            :key="i"
            class="_line"
            :class="{ 'is--new': line.is_new }"
            :style="{ width: line.width + '%' }"
          />
        </span>
      </span>
    </button>
  </div>
</template>
<script>
// Each schema shows the end of the previous chapter in grey and the start of
// the chapter in color, on a page (or a spread, to show left/right).
const grey = (width = 100) => ({ width, is_new: false });
const color = (width = 100) => ({ width, is_new: true });

export default {
  props: {
    options: Array,
    value: String,
  },
  computed: {
    current_key() {
      return this.value || "";
    },
  },
  methods: {
    sidesFor(key) {
      if (key === "left")
        return [
          { name: "is--left", lines: [color(80), color(100), color(60)] },
          { name: "is--right", lines: [color(100), color(90), color(70)] },
        ];
      if (key === "right")
        return [
          { name: "is--left", lines: [grey(100), grey(80), grey(40)] },
          { name: "is--right", lines: [color(80), color(100), color(60)] },
        ];
      if (key === "page")
        return [
          {
            name: "is--single",
            lines: [color(80), color(100), color(60), color(90)],
          },
        ];
      // in the flow: the chapter starts in the middle of the page
      return [
        {
          name: "is--single",
          lines: [grey(100), grey(70), color(90), color(100), color(50)],
        },
      ];
    },
  },
};
</script>
<style lang="scss" scoped>
._startsOnPagePicker {
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  gap: calc(var(--spacing) / 2);
}

._option {
  display: flex;
  padding: 3px;
  border: 2px solid transparent;
  border-radius: var(--border-radius);
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--c-gris_clair);
  }

  &.is--active {
    border-color: var(--c-bleumarine, var(--c-noir));
    background: var(--c-gris_clair);
  }
}

._schema {
  display: flex;
  flex-flow: row nowrap;
  height: 32px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

._page {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 3px;
  width: 23px;
  height: 100%;
  padding: 4px 3px;
  background: white;

  // fold between the two pages of a spread
  & + & {
    border-left: 1px dashed var(--c-gris_fonce);
  }
}

._line {
  flex: 0 0 auto;
  height: 2px;
  background: var(--c-gris);

  &.is--new {
    background: var(--c-bleumarine, var(--c-noir));
  }
}
</style>
