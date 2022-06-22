<template>
  <div class="m_metaField" @click="show_detail = !show_detail">
    <div>{{ $t(title) }}</div>
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
    date: String,
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
  methods: {
    formatDateToHuman(date) {
      return this.$moment(date).format("LL");
    },
    formatDateToPrecise(date) {
      return this.$moment(date).format("LTS L");
    },
  },
};
</script>
<style lang="scss"></style>
