<template>
  <div class="_metaField" @click="show_detail = !show_detail">
    <DLabel :str="title" />
    <div>
      <template v-if="!show_detail">{{ formatDateToHuman(date) }} </template>
      <template v-else>{{ formatDateTimeToPrecise(date) }}</template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    date: [Number, String],
    show_detail_initially: {
      type: Boolean,
      default: false,
    },
  },
  components: {},
  data() {
    return {
      show_detail: this.show_detail_initially,
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
<style lang="scss">
._metaField {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) / 16);
}
</style>
