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
      <div
        v-for="event in sorted_events"
        :key="event.$path"
        class="_list--item"
      >
        <CoverField
          class="_cover"
          :context="'preview'"
          :cover="event.$cover"
          :path="event.$path"
          :can_edit="false"
        />
        <div class="">
          <h3>
            {{ event.title }}
          </h3>
          <div class="_openEvent">
            <router-link
              :to="{ path: createURLFromPath(event.$path) }"
              class="u-buttonLink"
            >
              <div class="_clickZone" />

              <!-- {{ $t("open") }} -->
            </router-link>
          </div>
        </div>
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
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
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
      this.$router.push(url);
    },
  },
};
</script>
<style lang="scss" scoped>
._eventsList {
  margin: 0 auto;
  max-width: var(--max-column-width);
  padding: calc(var(--spacing) * 1);
}

._list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: calc(var(--spacing) / 1);
}

._list--item {
  position: relative;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
  border: 1px solid var(--c-gris);

  // box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    transform: translateY(-4px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
  }
}

._cover {
  position: relative;
  aspect-ratio: 3/2;
  flex: 0 0 100px;
  // overflow: hidden;
}

._openEvent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;

  ._clickZone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
