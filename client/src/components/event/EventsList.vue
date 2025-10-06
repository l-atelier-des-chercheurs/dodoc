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

    <div class="_lineCont"><div class="_line" /></div>
    <FlickityCarousel
      v-if="sorted_events.length > 0"
      :key="slider_key"
      :options="flickityOptions"
      class="_eventsCarousel"
      ref="flickity"
    >
      <div
        v-for="event in sorted_events"
        :key="event.$path"
        class="carousel-cell"
      >
        <div class="_eventsDate">
          <template v-if="event.start_date">
            {{ formatDateToPrecise(event.start_date) }}
            <template v-if="event.end_date">
              <b-icon icon="arrow-right-short" />
              {{ formatDateToPrecise(event.end_date) }}
            </template>
          </template>
        </div>
        <div class="_eventsCoverTitle">
          <CoverField
            class="_cover"
            :context="'preview'"
            :cover="event.$cover"
            :ratio="'3 / 2'"
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
                event
                @click.native.prevent="sliderClick"
              >
                <div class="_clickZone" />

                {{ $t("open") }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </FlickityCarousel>
  </div>
</template>
<script>
import FlickityCarousel from "@/adc-core/ui/FlickityCarousel.vue";

export default {
  props: {},
  components: {
    FlickityCarousel,
  },
  data() {
    return {
      events: undefined,
      path: "events",
      fetch_events_error: undefined,
      show_create_modal: false,

      flickityOptions: {
        initialIndex: 0,
        groupCells: false,
        pageDots: false,
        resize: true,
        selectedAttraction: 0.2,
        percentPosition: false,
        friction: 0.8,
        cellAlign: "left",
        contain: true,
      },
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
      const _sorted_events = this.events
        .slice()
        .filter((e) =>
          this.canLoggedinSeeFolder({
            folder: e,
          })
        )
        .sort((a, b) => +new Date(b.start_date) - +new Date(a.start_date));
      return _sorted_events;
      // return _sorted_events.concat(_sorted_events).concat(_sorted_events);
    },
    slider_key() {
      const all_paths = this.sorted_events.map((e) => e.$path);
      if (all_paths) return JSON.stringify(all_paths);
      return "none";
    },
  },
  methods: {
    openNewEvent(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      this.$router.push(url);
    },
    sliderClick(evt) {
      // Access Flickity instance
      const flickity = this.$refs.flickity && this.$refs.flickity.flickity;

      if (flickity && flickity.isPreventingClicks) {
        // Prevent click if dragging
        evt.preventDefault();
        return;
      }
      this.$router.push(evt.currentTarget.getAttribute("href"));
    },
  },
};
</script>
<style lang="scss" scoped>
._eventsList {
  overflow: visible;
  padding: calc(var(--spacing) * 2) 0;
}

._eventsCarousel {
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;

  :deep(.flickity-viewport) {
    overflow: visible;
  }
}

._eventsCoverTitle {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) / 1);
}
._eventsDate {
  display: flex;
  align-items: center;
  padding-bottom: 16px;
  height: 36px;
  font-size: var(--sl-font-size-small);

  &::after {
    content: "";
    width: 10px;
    height: 10px;
    background: var(--c-gris_fonce);
    position: absolute;
    top: 17px;
    left: -10px;
    border-radius: 50%;
    border: 4px solid white;
  }
}

._cover {
  position: relative;
  aspect-ratio: 3/2;
  flex: 0 0 150px;
  border-radius: 4px;
  overflow: hidden;
}

._lineCont {
  position: relative;
}
._line {
  position: absolute;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--c-gris_clair);
  // background: var(--c-gris_fonce);
  // background: var(--c-bleuvert);
  top: 24px;
}

._openEvent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;

  // display: flex;
  // justify-content: center;

  ._clickZone {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.carousel-cell.carousel-cell {
  width: clamp(280px, 30vw, 380px);
  aspect-ratio: auto !important;
  margin-right: calc(var(--spacing) * 2);

  &:hover,
  &:focus-visible {
    ._eventsDate {
      &::after {
        background: var(--active-color);
      }
    }
  }
}
</style>
