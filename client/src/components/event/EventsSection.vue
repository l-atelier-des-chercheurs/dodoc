<template>
  <div class="_eventsSection">
    <transition name="fade" mode="out-in">
      <EventsList v-if="!opened_event" key="list" />
      <OpenedEvent v-else :event_slug="opened_event" key="event" />
    </transition>
  </div>
</template>
<script>
import EventsList from "@/components/event/EventsList.vue";
import OpenedEvent from "@/components/event/OpenedEvent.vue";

export default {
  props: {},
  components: {
    EventsList,
    OpenedEvent,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    opened_event: {
      handler() {
        if (this.opened_event)
          this.$nextTick(() => {
            this.$el.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest",
            });
          });
      },
      immediate: true,
    },
  },
  computed: {
    opened_event() {
      return this.$route.hash.substring(1) || false;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._eventsSection {
  // background: white;
  overflow: hidden;
  margin: calc(var(--spacing) * 2) auto;
}
</style>
