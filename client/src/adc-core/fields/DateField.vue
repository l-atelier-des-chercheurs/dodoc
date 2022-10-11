<template>
  <div class="_metaField" @click="show_detail = !show_detail">
    <div class="u-label">{{ $t(title) }}</div>
    <div>
      <template v-if="!show_detail">{{ formatDateToHuman(date) }} </template>
      <template v-else>{{ formatDateToPrecise(date) }}</template>
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
<style lang="scss"></style>
