<template>
  <div>
    EventView
    {{ event }}
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      event: undefined,
    };
  },
  async created() {
    await this.getEvent();
    this.$api.join({ room: this.event_path });
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.event_path });
  },
  watch: {},
  computed: {
    event_path() {
      return this.createPath({ event_slug: this.$route.params.event_slug });
    },
  },
  methods: {
    async getEvent() {
      this.event = await this.$api
        .getFolder({
          path: this.event_path,
        })
        .catch(() => {
          return;
        });
    },
  },
};
</script>
<style lang="scss" scoped></style>
