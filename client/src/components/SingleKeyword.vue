<template>
  <div
    class="_singleKeyword"
    :class="{
      'is--clickable': $listeners.add,
    }"
  >
    <div class="">
      <div class="_category" :data-category="category">
        {{ category }}
      </div>
      <div class="_name">
        {{ name }}
      </div>
    </div>
    <sl-icon-button
      v-if="$listeners.remove"
      class="_white"
      name="dash-circle"
      @click="$emit('remove')"
    />
    <button
      type="button"
      v-if="$listeners.add"
      class="_addBtn"
      @click="$emit('add')"
    />
  </div>
</template>
<script>
export default {
  props: {
    keyword: String,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    category() {
      return this.keyword.split("/").at(0);
    },
    name() {
      return this.keyword.split("/").at(1);
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._singleKeyword {
  position: relative;
  background-color: rgba(255, 255, 255, 0.2);
  padding: calc(var(--spacing) / 4) calc(var(--spacing) / 2);
  border-radius: 4px;
  color: white;
  line-height: 1.2;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  gap: calc(var(--spacing) / 1);

  sl-icon-button::part(base) {
    color: currentColor;
    padding: 0;
  }

  &.is--clickable:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
}

._category {
  font-size: 80%;

  &[data-category="techniques"] {
    color: var(--color-vert);
  }
  &[data-category="gisement"] {
    color: var(--color-rouge);
  }
  &[data-category="lieu"] {
    color: var(--color-bleu);
  }
  &[data-category="domaine"] {
    color: var(--color-jaune);
  }
}
._name {
  font-size: 110%;
}

._addBtn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: transparent;
}
</style>
