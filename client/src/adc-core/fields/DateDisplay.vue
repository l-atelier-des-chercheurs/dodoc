<template>
  <div class="u-metaField" @click="show_detail = !show_detail">
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
<style lang="scss"></style>
