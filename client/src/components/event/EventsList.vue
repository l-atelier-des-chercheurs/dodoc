<template>
  <div class="_eventsList">
    <div class="u-sameRow u-spacingBottom">
      <DLabel :str="$t('events')" />
      <button
        type="button"
        class="u-button u-button_orange u-button_small"
        v-if="is_instance_admin || is_instance_contributor"
        @click="show_create_modal = true"
      >
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 168 168"
          style="enable-background: new 0 0 168 168"
          xml:space="preserve"
        >
          <path
            style="fill: #ffbe32"
            d="M24.6,24.4c-32.8,32.8-32.8,86.1,0,119c32.8,32.8,85.9,32.8,118.7,0c32.8-32.8,32.8-85.9,0-118.7
		C110.5-8.2,57.5-8.2,24.6,24.4z"
          />
          <polygon
            style="fill: #ffffff"
            points="132.3,73.4 132.3,94.4 94.6,94.4 94.6,132.1 73.6,132.1 73.6,94.4 35.9,94.4 35.9,73.4 
		73.6,73.4 73.6,35.7 94.6,35.7 94.6,73.4 		"
          />
        </svg>
        &nbsp;
        {{ $t("create") }}
      </button>
      <CreateFolder
        v-if="show_create_modal"
        :modal_name="$t('create_an_event')"
        :path="'events'"
        @close="show_create_modal = false"
        @openNew="openNewEvent"
      />
    </div>

    <div class="_list">
      <div v-for="event in sorted_events" :key="event.$path">
        <h3>
          {{ event.title }}
        </h3>
        <router-link :to="{ path: createURLFromPath(event.$path) }">
          {{ $t("open") }}
        </router-link>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      events: undefined,
      path: "events",
      fetch_events_error: undefined,
      show_create_modal: false,
    };
  },
  created() {},
  async mounted() {
    this.events = await this.$api
      .getFolders({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_events_error = err.response;
        // this.is_loading = false;
        return;
      });
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {},
  watch: {},
  computed: {
    sorted_events() {
      if (!this.events) return [];
      return this.events
        .slice()
        .filter((e) =>
          this.canLoggedinSeeFolder({
            folder: e,
          })
        )
        .sort(
          (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
        );
    },
  },
  methods: {
    openNewEvent(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      debugger;
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._eventsList {
  padding: calc(var(--spacing) / 1);
  padding: calc(var(--spacing) / 1);
}

._list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: calc(var(--spacing) / 1);
  margin: calc(var(--spacing) * 1) 0;
}
</style>
