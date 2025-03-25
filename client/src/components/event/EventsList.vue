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
    <flickity
      class="_flickity"
      ref="flickity"
      :options="flickityOptions"
      v-if="sorted_events.length > 0"
    >
      <!-- <div class="_slide">A</div>
      <div class="_slide">B</div>
      <div class="_slide">C</div>
      <div class="_slide">D</div> -->
      <div v-for="event in sorted_events" :key="event.$path" class="_slide">
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
    </flickity>
  </div>
</template>
<script>
// import Flickity from "vue-flickity";

export default {
  props: {},
  components: {
    Flickity,
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
        imagesLoaded: true,
        pageDots: false,
        resize: true,
        // arrowShape:
        //   "M87.46,49.46,73.39,64.77a65.3,65.3,0,0,1-6.15,6.15A47.8,47.8,0,0,1,61,75.29H131.6V91.14H61A39.1,39.1,0,0,1,67,95.51q2.81,2.46,6.36,6.15L87.46,117,74.48,128,34.17,83.21,74.48,38.39Z",
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
  },
  methods: {
    openNewEvent(new_folder_slug) {
      this.show_create_modal = false;
      const url = this.createURLFromPath(this.path + "/" + new_folder_slug);
      this.$router.push(url);
    },
    sliderClick(evt) {
      if (this.$refs.flickity.$flickity.isPreventingClicks) return false;
      this.$router.push(evt.currentTarget.getAttribute("href"));
    },
  },
};
</script>
<style lang="scss" scoped>
._eventsList {
  margin: 0 auto;
  // max-width: var(--max-column-width);
  padding: calc(var(--spacing) * 2) 0;
}

._list {
  // display: grid;
  // grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  // gap: calc(var(--spacing) / 1);
}
._flickity {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  max-width: var(--max-column-width);
  // overflow: hidden;
  // padding: 0 calc(var(--spacing) * 1);

  ::v-deep {
    .flickity-button {
      background: transparent;
      background: rgba(255, 255, 255, 1);
    }
    .flickity-button:hover {
      background: var(--c-gris);
    }

    .flickity-prev-next-button {
      overflow: hidden;
    }
    .flickity-button:disabled {
      display: none;
    }

    .flickity-prev-next-button .flickity-button-icon {
      // left: -68%;
      // top: -75%;
      // width: 150%;
      // height: 150%;
    }

    .flickity-prev-next-button.previous {
      left: -10px;
    }
    .flickity-prev-next-button.next {
      right: -10px;
    }
  }
}

._slide {
  position: relative;
  width: 280px;
  min-height: 100px;
  padding: 0 calc(var(--spacing) * 1);

  max-width: 56ch;
  width: 100%;

  transition: all 0.2s cubic-bezier(0.19, 1, 0.22, 1);

  &:hover,
  &:focus-visible {
    // transform: translateY(-4px);
    // box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);

    ._eventsDate::after {
      background: var(--active-color);
    }
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
    background: var(--c-bleuvert);
    position: absolute;
    top: 17px;
    left: 5px;
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
  height: 2px;
  background: var(--c-gris);
  top: 25px;
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
</style>
