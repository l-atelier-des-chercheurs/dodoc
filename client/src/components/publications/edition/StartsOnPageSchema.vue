<template>
  <span class="_schema">
    <span
      v-for="side in sides"
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
</template>
<script>
// Each schema shows the end of the previous chapter in grey and the start of
// the chapter in color, on a page (or a spread, to show left/right).
const grey = (width = 100) => ({ width, is_new: false });
const color = (width = 100) => ({ width, is_new: true });

export default {
  props: {
    option_key: String,
  },
  computed: {
    sides() {
      if (this.option_key === "left")
        return [
          { name: "is--left", lines: [color(80), color(100), color(60)] },
          { name: "is--right", lines: [color(100), color(90), color(70)] },
        ];
      if (this.option_key === "right")
        return [
          { name: "is--left", lines: [grey(100), grey(80), grey(40)] },
          { name: "is--right", lines: [color(80), color(100), color(60)] },
        ];
      if (this.option_key === "page")
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
._schema {
  display: flex;
  flex: 0 0 auto;
  flex-flow: row nowrap;
  height: var(--schema-height, 32px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

._page {
  display: flex;
  flex-flow: column nowrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 2px;
  // keeps the page ratio whatever the schema height
  width: calc(var(--schema-height, 32px) * 0.72);
  height: 100%;
  padding: 3px 2px;
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
