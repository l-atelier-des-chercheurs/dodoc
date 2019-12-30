<template>
  <div class="m_metaField" @click="show_detail = !show_detail">
    <div>{{ $t(title) }}</div>
    <div>
      <template v-if="!show_detail"
        >{{ $root.formatDateToHuman(date) }}
      </template>
      <template v-else>{{ $root.formatDateToPrecise(date) }}</template>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    title: String,
    date: String
  },
  components: {},
  data() {
    return {
      show_detail: false
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {}
};
</script>
<style lang="scss"></style>
