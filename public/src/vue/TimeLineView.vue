<template>
  <div>

    <NavbarTop
      :folder="folder"
      :slugFolderName="slugFolderName"
      :visibleDay="timelineViewport.visibleDay"
      @toggleSidebar="toggleSidebar()"
      :timelineViewport_scale="timelineViewport.scale"
    >
    </NavbarTop>

    <transition name="fade" :duration="350">
      <div
        v-if="$root.settings.is_loading_medias_for_folder"
        class="loader_folder flex-wrap flex-vertically-centered flex-horizontally-centered"
      >
        <span class="animated flash">
          {{ $t('loading') }}
        </span>
      </div>
    </transition>

    <transition name="sidebar-animation" :duration="350">
      <Sidebar
        v-if="$root.settings.has_sidebar_opened"
        :folder="folder"
        :slugFolderName="slugFolderName"
        :visibleDay="timelineViewport.visibleDay"
        :medias="medias"
        :timelineInfos="timelineInfos"
        :isRealtime="isRealtime"
        :style="{ height: `${sidebarHeight}px` }"
        :read_only="read_only"
      >
      </Sidebar>
    </transition>

    <button type="button"
      class="button_sidebarToggle"
      @click.prevent="toggleSidebar()"
      :class="{ 'is--collapsed' : !$root.settings.has_sidebar_opened }"
    >
      <template v-if="$root.settings.has_sidebar_opened">←</template>
      <template v-else>→</template>
    </button>

    <EditFolder
      v-if="showEditFolderModal"
      :folder="folder"
      :slugFolderName="slugFolderName"
      @close="showEditFolderModal = false"
      :read_only="read_only"
    >
    </EditFolder>

    <div class="m_timeline"
      ref="timeline"
      @scroll="onScroll"
      :class="{
        'with--sidebar_opened' : $root.settings.has_sidebar_opened,
        'is--animated': isAnimated,
        'is--realtime': isRealtime
      }"
    >
      <div class="m_timeline-container"
        :style="{
          width: `${timelineViewport.width}px`,
          height: `${timelineViewport.height}px`
        }"
      >
        <div class="timeline_track">
        </div>

        <!-- GRID -->
        <div class="grid_overlay">
          <div class="grid_overlay--wrapper">

            <div
              v-if="overallGrid.days.length > 0"
              v-for="item in overallGrid.days"
              class="gridItem font-small gridItem_isday"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="`transform: translate(${item.xPos}px, 0px)`"
              :key="item.caption"
            >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="overallGrid.hours.length > 0"
              v-for="(item, index) in overallGrid.hours"
              class="gridItem font-small gridItem_ishour"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="`transform: translate(${item.xPos}px, 0px)`"
              :key="`hrs-${index}-${item.xPos}`"
            >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="overallGrid.minutes.length > 0"
              v-for="(item, index) in overallGrid.minutes"
              class="gridItem font-small gridItem_isminute"
              :class="{ 'has--caption' : (item.caption !== undefined) }"
              :style="`transform: translate(${item.xPos}px, 0px)`"
              :key="`min-${index}-${item.xPos}`"
            >
              <div v-if="item.caption !== undefined" class="gridItem--caption">
                {{ item.caption }}
              </div>
            </div>

            <div
              v-if="isRealtime"
              class="gridItem font-small gridItem_isrealtimerule"
              :style="`transform: translate(${todaysRule.xPos}px, 0px)`"
            >
              <div class="gridItem--caption">
                {{ todaysRule.caption }}
              </div>
              <button type="button" class="gridItem_isrealtimerule--autoscroll_checkbox button-small bg-rouge_vif border-circled button-thin button-wide padding-verysmall margin-none" >
                <small>
                  <label for="autoScroll" class="margin-none">
                    <input
                      type="checkbox"
                      v-model="timelineViewport.autoscroll"
                      id="autoScroll"
                    ><span v-html="$t('auto_scroll')"></span>
                  </label>
                </small>
              </button>
            </div>

            <transition name="fade" :duration="250">
              <div
                v-if="zoomZone.display"
                class="gridItem gridItem_zoomZone"
                :style="zoomZoneStyle()"
              >
              </div>
            </transition>
          </div>
        </div>

        <template v-if="Object.keys(medias).length > 0">
          <TimelineMedia v-for="(media, index) in medias"
            :key="index"
            :ref="`media_${index}`"
            :slugFolderName="slugFolderName"
            :slugMediaName="index"
            :is_placeholder="!mediaIsClose(index,media)"
            :media="media"
            :timelineScale="timelineViewport.scale"
            :timelineHeight="timelineHeight"
            :posX="getMediaPosX(index)"
            :class="{ 'is--highlighted' : highlightedMedia === index }"
            @open="openMediaModal(index)"
            :read_only="read_only"
          >
          </TimelineMedia>
        </template>

        <template v-else>
          <div class="nomediainfo">
            <code>
              <template v-if="folder.authorized">
                {{ $t('no_media_in_folder') }}
              </template>
              <template v-else>
                {{ $t('no_public_media_in_folder') }}
              </template>
            </code>
          </div>
        </template>

      </div>

      <AddMediaButton
        v-if="
          ((folder.password === 'has_pass' && folder.authorized) || folder.password !== 'has_pass') && $root.state.connected"
        :slugFolderName="slugFolderName"
        :read_only="read_only"
      >
      </AddMediaButton>

      <EditMedia
        v-if="showMediaModalFor !== ''"
        :slugFolderName="slugFolderName"
        :slugMediaName="showMediaModalFor"
        :media="medias[showMediaModalFor]"
        :isRealtime="isRealtime"
        :currentTime="currentTime"
        @close="showMediaModalFor = ''"
        :read_only="read_only"
      >
      </EditMedia>

    </div>
  </div>
</template>
<script>
import NavbarTop from './components/NavbarTop.vue';
import Sidebar from './components/Sidebar.vue';
import AddMediaButton from './components/AddMediaButton.vue';
import EditFolder from './components/modals/EditFolder.vue';

import TimelineMedia from './components/TimelineMedia.vue';
import EditMedia from './components/modals/EditMedia.vue';
import DateTime from './components/subcomponents/DateTime.vue';

import debounce from 'debounce';
import _ from 'underscore';

let allMediasPosition = {};
let isScrollingTimeout;

export default {
  props: {
    slugFolderName: String,
    folder: Object,
    medias: Object,
    read_only: Boolean
  },
  components: {
    TimelineMedia,
    EditMedia,
    EditFolder,
    NavbarTop,
    Sidebar,
    AddMediaButton,
    DateTime
  },
  data() {
    return {
      systemBar: document.getElementById('systemBar') !== null ? 22 - 6 : 0,
      topNavbarHeight: 50,
      timelinetrackHeight: 50,
      timelineHeight: 0,
      bottomScrollBar: 20,
      sidebarWidth: parseFloat(
        window
          .getComputedStyle(document.querySelector('html'))
          .getPropertyValue('--sidebar-width')
      ),

      showMediaModalFor: '',
      highlightedMedia: '',
      showEditFolderModal: false,

      isRealtime: false,
      isAnimated: true,
      isAdjustingScale: false,
      timelineUpdateRoutine: '',
      isScrolling: false,

      currentScrollEvent: undefined,

      currentTime: this.$moment().millisecond(0),
      todaysRule: {
        caption: '',
        xPos: false
      },
      zoomZone: {
        display: false,
        xPos: 0,
        width: 50
      },

      overallGrid: {
        days: [],
        hours: [],
        minutes: []
      },

      // this object contains a start and end for this timeline, ven if it is realtime
      // for example 2017-07-01 13:22 and 2017-07-12 12:24
      timelineInfos: {
        start: 0,
        end: 0
      },
      timelineViewport: {
        // this object contains a start and end for this view,
        // for example 2017-07-01 13:22 and 2017-07-01 23:59
        start: 0,
        end: 0,
        width: 1,
        height: 1,
        scale: this.$root.getProjectScale(this.slugFolderName),
        visibleDay: 0,
        scrollLeft: this.$root.getScrollLeft(this.slugFolderName),
        autoscroll: false,
        longestIntervalTS: 86400000 * 10,
        leftPadding: 0,
        viewerWidth: 0
      }
    };
  },
  watch: {
    folder: function() {
      console.log('WATCH • TimeLineView: folder');
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
      this.setViewedTimelineWidthAndHeight();
      this.updateMediaData();
      this.updateGridData();
    },
    medias: function() {
      this.updateMediaData();
    },
    'timelineViewport.scale': function() {
      console.log('WATCH • TimeLineView: timelineViewport.scale');

      // disable media animations
      this.isAnimated = false;

      // before updating the scale, we get the percent that's currently shown, store it, and we go back to it right after scaling
      let currentScrollLeft = this.$refs.timeline.scrollLeft;
      let currentScrollMiddle =
        currentScrollLeft +
        this.timelineViewport.viewerWidth / 2 -
        this.timelineViewport.leftPadding;
      let currentScrollMiddle_percent =
        currentScrollMiddle / this.timelineViewport.width;

      this.setViewedTimelineWidthAndHeight();

      this.updateGridData();
      this.updateMediaData();

      // reenable media animations
      this.$nextTick(() => {
        let newScrollMiddle =
          this.timelineViewport.width * currentScrollMiddle_percent;
        let newScrollLeft =
          newScrollMiddle -
          this.timelineViewport.viewerWidth / 2 +
          this.timelineViewport.leftPadding;
        this.$refs.timeline.scrollLeft = newScrollLeft;
        this.drawRealtimeRule();
        this.isAnimated = true;
      });

      this.$root.updateProjectScale(
        this.slugFolderName,
        this.timelineViewport.scale
      );
    },
    'timelineViewport.scrollLeft': function() {
      console.log('WATCH • TimeLineView: timelineViewport.scrollLeft');
      this.$root.updateProjectScrollLeft(
        this.slugFolderName,
        this.timelineViewport.scrollLeft
      );
      this.setVisibleDay();
    },
    'timelineViewport.visibleDay': function() {
      this.updateGridData();
    }
  },
  created() {
    console.log('CREATED • TimeLineView: folder');

    this.setTimelineBounds();
    this.setViewedTimelineBoundsFromInfos();
    this.setTimelineHeight();
    this.setViewedTimelineWidthAndHeight();
    this.updateMediaData();
    this.setVisibleDay();
  },
  mounted() {
    this.onResize = debounce(this.onResize, 300);
    window.addEventListener('resize', this.onResize);

    this.$eventHub.$on('scrollToMedia', this.scrollToMedia);
    this.$eventHub.$on('scrollToDate', this.scrollToDate);
    this.$eventHub.$on('highlightMedia', this.highlightMedia);
    this.$eventHub.$on('updateScale', this.updateTimelineViewportScale);
    this.$eventHub.$on('goToPrevScreen', this.goToPrevScreen);
    this.$eventHub.$on('goToNextScreen', this.goToNextScreen);
    this.$eventHub.$on('goToPrevDay', this.goToPrevDay);
    this.$eventHub.$on('goToNextDay', this.goToNextDay);
    this.$eventHub.$on('showEditFolderModal', this.startEditModal);
    this.$eventHub.$on('timeline.scrollToToday', this.scrollToToday);
    this.$eventHub.$on('timeline.openMediaModal', this.openMediaModal);
    this.$eventHub.$on('timeline.showZoomZone', this.showZoomZone);
    this.$eventHub.$on('timeline.hideZoomZone', this.hideZoomZone);

    this.timelineViewport.leftPadding = parseInt(
      $(this.$refs.timeline).css('padding-left'),
      10
    );
    this.updateViewerWidth();

    // set scrollLeft to match timelineViewport.scrollLeft
    this.$refs.timeline.scrollLeft = this.timelineViewport.scrollLeft;

    if (this.timelineViewport.autoscroll) {
      this.scrollToToday();
    }
    // refresh everything that depends upon scrollLeft
    this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft + 1;

    this.timelineUpdateRoutine = setInterval(() => {
      if (this.isScrolling || !this.isRealtime) {
        return;
      }

      console.log(
        `METHODS • TimeLineView: setInterval updating (timelineUpdateRoutine)`
      );

      this.currentTime = this.$moment().millisecond(0);
      this.setTimelineBounds();
      this.setViewedTimelineBoundsFromInfos();
      this.setViewedTimelineWidthAndHeight();

      if (this.timelineViewport.scrollLeft !== this.$refs.timeline.scrollLeft) {
        this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
        this.setVisibleDay();
      }

      this.drawRealtimeRule();

      if (this.timelineViewport.autoscroll) {
        this.scrollToToday();
      }
    }, 1000);
  },
  beforeDestroy() {
    this.$eventHub.$off('scrollToMedia');
    this.$eventHub.$off('scrollToDate');
    this.$eventHub.$off('highlightMedia');
    this.$eventHub.$off('updateScale');
    this.$eventHub.$off('goToPrevScreen');
    this.$eventHub.$off('goToNextScreen');
    this.$eventHub.$off('goToPrevDay');
    this.$eventHub.$off('goToNextDay');
    this.$eventHub.$off('showEditFolderModal');
    this.$eventHub.$off('timeline.scrollToToday', this.scrollToToday);
    this.$eventHub.$off('timeline.openMediaModal', this.openMediaModal);
    this.$eventHub.$off('timeline.showZoomZone', this.showZoomZone);
    this.$eventHub.$off('timeline.hideZoomZone', this.hideZoomZone);

    window.removeEventListener('resize', this.onResize);

    clearInterval(this.timelineUpdateRoutine);
  },
  computed: {},
  methods: {
    /******************************************************************
        Updates timelineInfos with folder start and end
    ******************************************************************/
    setTimelineBounds() {
      console.log('METHODS • TimeLineView: setTimelineBounds');
      this.timelineInfos.start = this.getTimelineStart(this.folder.start);
      this.timelineInfos.end = this.getTimelineEnd(this.folder.end);
    },
    // retourne une valeure en pixel qui dépend de la hauteur de la timeline
    getTimelineStart(ts) {
      if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
      } else {
        console.log(`WARNING: no timeline start. This can’t work.`);
        throw `Missing timeline start`;
      }
      return;
    },
    getTimelineEnd(ts) {
      if (ts && this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isValid()) {
        // if end is in the future
        if (
          this.$moment(ts, 'YYYY-MM-DD HH:mm:ss', true).isAfter(this.$moment())
        ) {
          this.isRealtime = true;
          return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
          // if end is is in the present or past
        } else {
          this.isRealtime = false;
          return this.$moment(ts, 'YYYY-MM-DD HH:mm:ss');
        }
      } else {
        // there is no valid end, we set end to current time and set realtime
        this.isRealtime = true;
        return this.currentTime;
      }
    },

    /******************************************************************
        Updates viewed timeline with a start and end
    ******************************************************************/
    setViewedTimelineBoundsFromInfos() {
      console.log('METHODS • TimeLineView: setViewedTimelineBoundsFromInfos');
      const newStart = this.getViewedTimelineStart(this.timelineInfos.start);
      if (+newStart !== +this.timelineViewport.start) {
        this.timelineViewport.start = newStart;
      }
      const newEnd = this.getViewedTimelineEnd(this.timelineInfos.end);
      if (+newEnd !== +this.timelineViewport.end) {
        this.timelineViewport.end = newEnd;
      }
    },

    setViewedTimelineWidthAndHeight() {
      console.log('METHODS • TimeLineView: setViewedTimelineWidthAndHeight');

      // récupérer la longueur de la timeline en TS
      let timeEllapsed =
        this.timelineViewport.end - this.timelineViewport.start;
      // décomposer en secondes
      let secondsEllapsed = timeEllapsed / 1000;

      let w = Math.floor(secondsEllapsed / this.timelineViewport.scale);
      let h = Math.floor(this.timelineHeight);

      // prevent viewport width to be 0
      this.timelineViewport.width = Math.max(w, 1);
      this.timelineViewport.height = h;
    },
    getViewedTimelineStart(timelineView_new_start) {
      // Sanitize new date
      if (timelineView_new_start.isBefore(this.timelineInfos.start)) {
        return this.$moment(this.timelineInfos.start);
      }
      if (timelineView_new_start.isAfter(this.timelineInfos.end)) {
        return this.$moment(this.timelineInfos.end);
      }
      // Sanitize new date
      return timelineView_new_start;
    },
    getViewedTimelineEnd(timelineView_new_end) {
      return timelineView_new_end;
    },

    /******************************************************************
        Updates medias and grid position according to viewed timeline
    ******************************************************************/
    getMediaPosX(slugMediaName) {
      return allMediasPosition[slugMediaName].created;
    },
    getDurationMediaPosX(slugMediaName, type) {
      return allMediasPosition[slugMediaName][type];
    },

    updateMediaData() {
      console.log('METHODS • TimeLineView: updateMediaData');

      Object.keys(this.medias).map(slugMediaName => {
        let media = this.medias[slugMediaName];
        let date_timeline = this.$moment.isMoment(media.date_timeline)
          ? media.date_timeline
          : this.$moment(media.date_timeline, 'YYYY-MM-DD HH:mm:ss');
        let posX = this.getXPositionFromDate(+date_timeline, false);

        if (media.duration !== undefined) {
          let startRecordingDate = date_timeline.subtract(
            parseInt(media.duration),
            'seconds'
          );
          let start_posX = this.getXPositionFromDate(
            +startRecordingDate,
            false
          );

          allMediasPosition[slugMediaName] = {
            started: start_posX,
            created: posX
          };
        } else {
          allMediasPosition[slugMediaName] = {
            created: posX
          };
        }
      });

      // check if there is a justCreatedTextmediaID val
      if (this.$root.justCreatedTextmediaID) {
        // if there is, try to match it with mediaID of listed medias
        let mediaJustCreatedSlug = Object.keys(this.medias).filter(x => {
          return this.medias[x].mediaID === this.$root.justCreatedTextmediaID;
        })[0];

        // do a findwhere in medias
        if (mediaJustCreatedSlug !== undefined) {
          this.$root.justCreatedTextmediaID = false;
          this.$nextTick(() => {
            this.openMediaModal(mediaJustCreatedSlug);
          });
        }
      }
    },
    updateGridData() {
      console.log('METHODS • TimeLineView: updateGridData');

      let timeEllapsed =
        this.timelineViewport.end - this.timelineViewport.start;
      let overallGrid = { minutes: [], hours: [], days: [] };

      /****************************** make DAY ticks ******************************/
      let createDayTick = (thisDay, f = 'L') => {
        let xPos = this.getXPositionFromDate(thisDay);
        if (xPos === false) {
          return;
        }
        let caption = this.$moment(thisDay).format(f);
        overallGrid.days.push({ xPos, caption });
      };

      createDayTick(this.timelineViewport.start, 'LLL');
      let nextDay = this.$moment(
        this.$moment(this.timelineViewport.start)
          .startOf('day')
          .add(1, 'day')
      );

      // we need to iterate by day (and not every 24 hours, because of possible daylight savings)
      for (
        var d = nextDay;
        d.isSameOrBefore(this.$moment(this.timelineViewport.end));
        d.add(1, 'days')
      ) {
        createDayTick(d);
      }

      // only show HOUR and MINUTES for two screens on the left and right
      // to do that, we create a const for the current timestamp and another for the number of ms we show the grid
      let thisDayStart = this.$moment(this.timelineViewport.visibleDay)
        .subtract(2, 'days')
        .startOf('day');
      const timeEllapsedDay = 5 * 24 * 60 * 60 * 1000;

      /****************************** make HOUR ticks ******************************/

      let createHourTick = (currentHour, withCaption = false) => {
        let xPos = this.getXPositionFromDate(currentHour);
        if (xPos === false) {
          return;
        }
        if (!this.elesIsClose(xPos, 4)) {
          return;
        }

        let caption;
        if (withCaption || this.timelineViewport.scale < 70) {
          caption = this.$moment(currentHour).format('LT');
        }
        overallGrid.hours.push({ xPos, caption });
      };

      createHourTick(this.timelineViewport.start, true);
      for (var h = 3600000; h < timeEllapsedDay; h += 3600000) {
        let currentHour = thisDayStart + h;
        createHourTick(currentHour);
      }

      if (this.timelineViewport.scale <= 10) {
        /****************************** make MINUTES ticks ******************************/
        let createMinuteTick = currentMinute => {
          let xPos = this.getXPositionFromDate(currentMinute);
          if (xPos === false) {
            return;
          }
          const currentMinute_minutesOnly = new Date(
            currentMinute
          ).getMinutes();
          if (currentMinute_minutesOnly === 0) {
            return;
          }
          if (!this.elesIsClose(xPos)) {
            return;
          }

          let caption;
          if (
            currentMinute_minutesOnly % 10 === 0 ||
            this.timelineViewport.scale < 5
          ) {
            caption = this.$moment(currentMinute).format('LT');
          }
          overallGrid.minutes.push({ xPos, caption });
        };

        for (var m = 0; m < timeEllapsedDay; m += 60000) {
          let currentMinute = thisDayStart + m;
          createMinuteTick(currentMinute);
        }
      }

      this.overallGrid = overallGrid;
    },

    getXPositionFromDate(timestamp, removeFromTimelineIfOutOfBounds = true) {
      let msSinceStart = timestamp - this.timelineViewport.start;
      let pc =
        msSinceStart /
        (this.timelineViewport.end - this.timelineViewport.start);

      // What to do if the element (grid item or media) is out of the timeline
      if (pc < 0 || pc > 1) {
        if (removeFromTimelineIfOutOfBounds) {
          return false;
        }
      }
      pc = Math.min(Math.max(parseFloat(pc), 0), 1);
      let posX = this.timelineViewport.width * pc;
      return Math.floor(posX);
    },
    getDateFromXPosition(posX) {
      let pc = posX / this.timelineViewport.width;
      let viewportLength =
        this.timelineViewport.end - this.timelineViewport.start;
      let timeSinceStart = pc * viewportLength;
      return this.$moment(timeSinceStart + this.timelineViewport.start);
    },
    mediaIsClose(index, media) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimeLineView: mediaIsClose');
      }

      if (typeof this.$refs.timeline === 'undefined') {
        return false;
      }

      // check if media has duration
      if (media.duration !== undefined) {
        // calculate proximity for end
        if (this.elesIsClose(this.getDurationMediaPosX(index, 'end'))) {
          return true;
        }
        // otherwise, calculate proximity for start (see method updateMediaData)
        if (this.elesIsClose(this.getDurationMediaPosX(index, 'start'))) {
          return true;
        }
        // finally, let’s check whether we are in between those two dates
        let centerOfTimeline =
          this.timelineViewport.scrollLeft +
          this.timelineViewport.viewerWidth / 2;
        if (
          this.getDurationMediaPosX(index, 'start') < centerOfTimeline &&
          centerOfTimeline < this.getDurationMediaPosX(index, 'end')
        ) {
          return true;
        }
      } else {
        return this.elesIsClose(this.getMediaPosX(index));
      }

      return false;
    },
    elesIsClose(xPos, screenMultiplier = 2) {
      if (
        xPos <
        this.timelineViewport.scrollLeft +
          this.timelineViewport.viewerWidth / 2 -
          window.innerWidth * screenMultiplier
      ) {
        return false;
      }
      if (
        xPos >
        this.timelineViewport.scrollLeft +
          this.timelineViewport.viewerWidth / 2 +
          window.innerWidth * screenMultiplier
      ) {
        return false;
      }
      return true;
    },
    onResize() {
      console.log(`METHODS • TimeLineView: onResize`);
      this.setTimelineHeight();
      this.setViewedTimelineWidthAndHeight();
      this.updateViewerWidth();
    },
    updateViewerWidth() {
      console.log(`METHODS • TimeLineView: updateViewerWidth`);
      this.timelineViewport.viewerWidth = this.$refs.timeline.offsetWidth;
    },
    setTimelineHeight() {
      console.log(`METHODS • TimeLineView: setTimelineHeight`);
      this.timelineHeight =
        window.innerHeight -
        this.topNavbarHeight -
        this.bottomScrollBar -
        this.systemBar;
      this.sidebarHeight =
        window.innerHeight - this.topNavbarHeight - this.systemBar;
    },
    onScroll() {
      if (!this.isScrolling) {
        console.log(`METHODS • TimeLineView: onScroll / scroll has started`);
        this.isScrolling = true;
      }

      // Two possibilities there: either we wait until the scroll is finished to update everything
      // (which is a very low-perf mode)

      // OR we update progressively, every once in a while when scroll is detected

      if (this.$root.settings.perf_mode === 'low') {
        console.log(`METHODS • TimeLineView: onScroll / is happening`);
        clearTimeout(isScrollingTimeout);

        isScrollingTimeout = setTimeout(() => {
          console.log(`METHODS • TimeLineView: onScroll / has finished`);
          this.isScrolling = false;
          // the following line will trigger watch: scrollLeft (which takes care of everything)
          this.$nextTick(() => {
            this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
          });
        }, 100);
      } else {
        console.log(`METHODS • TimeLineView: onScroll / is happening`);
        if (isScrollingTimeout === undefined) {
          isScrollingTimeout = setTimeout(() => {
            console.log(`METHODS • TimeLineView: onScroll / update`);
            this.isScrolling = false;
            // the following line will trigger watch: scrollLeft (which takes care of everything)
            this.$nextTick(() => {
              this.timelineViewport.scrollLeft = this.$refs.timeline.scrollLeft;
            });
            isScrollingTimeout = undefined;
          }, 150);
        }
      }
    },
    openMediaModal(slugMediaName) {
      // check if media exists first
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • TimeLineView: openMediaModal');
      }

      if (!this.medias.hasOwnProperty(slugMediaName)) {
        if (this.$root.state.dev_mode === 'debug') {
          console.log(
            'METHODS • TimeLineView: openMediaModal / missing media in timeline'
          );
        }
      }

      this.showMediaModalFor = slugMediaName;
    },
    closeMediaModal() {
      this.showMediaModalFor = '';
    },
    drawRealtimeRule() {
      if (!this.isRealtime) {
        return;
      }

      let xPos = this.getXPositionFromDate(this.currentTime);
      if (xPos === false) {
        this.todaysRule.xPos = false;
        return;
      }

      console.log('METHODS • TimeLineView: drawRealtimeRule');
      let caption = this.currentTime.format('HH:mm:ss');
      this.todaysRule = {
        caption,
        xPos
      };
    },
    scrollToEnd() {
      this.$refs.timeline.scrollLeft = this.timelineViewport.width;
    },
    scrollToToday() {
      console.log(`METHODS • TimeLineView: scrollToToday`);
      this.scrollToDate(this.currentTime);
    },
    scrollToMedia(slugMediaName) {
      console.log(
        `METHODS • TimeLineView: scrollToMedia / slugMediaName: ${slugMediaName}`
      );
      let mediaToScrollTo = this.medias[slugMediaName];
      let mediaPosX = this.getMediaPosX(slugMediaName);

      mediaPosX = this.adjustPosXValueForScrollX(mediaPosX);
      this.scrollTimelineToXPos(mediaPosX);
    },
    scrollToDate(timestamp) {
      console.log(
        `METHODS • TimeLineView: scrollToDate / timestamp: ${timestamp}`
      );
      let xPos = this.getXPositionFromDate(timestamp, false);

      xPos = this.adjustPosXValueForScrollX(xPos);
      this.scrollTimelineToXPos(xPos);
    },
    adjustPosXValueForScrollX(xPos) {
      xPos -= this.timelineViewport.viewerWidth / 2;
      xPos += this.timelineViewport.leftPadding;
      return xPos;
    },

    highlightMedia(slugMediaName) {
      this.highlightedMedia = slugMediaName;
    },
    goToPrevDay() {
      console.log(`METHODS • TimeLineView: goToPrevDay`);
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(
        twentyFourHoursInSeconds / this.timelineViewport.scale
      );
      this.scrollTimelineToXPos(
        this.$refs.timeline.scrollLeft - twentyFourHoursInPixels
      );
    },
    goToNextDay() {
      console.log(`METHODS • TimeLineView: goToNextDay`);
      let twentyFourHoursInSeconds = 24 * 60 * 60;
      let twentyFourHoursInPixels = Math.floor(
        twentyFourHoursInSeconds / this.timelineViewport.scale
      );
      this.scrollTimelineToXPos(
        this.$refs.timeline.scrollLeft + twentyFourHoursInPixels
      );
    },
    /*
    // TODO: recalc pos with this.timelineViewport.viewerWidth/2
    goToPrevScreen() {
      console.log(`METHODS • TimeLineView: goToPrevScreen`);
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft - delta );
    },
    goToNextScreen() {
      console.log(`METHODS • TimeLineView: goToNextScreen`);
      let delta = this.$root.settings.has_sidebar_opened ? window.innerWidth - this.sidebarWidth : window.innerWidth;
      this.scrollTimelineToXPos(this.$refs.timeline.scrollLeft + delta);
    },
*/
    scrollTimelineToXPos(xPos_new) {
      console.log(
        `METHODS • TimeLineView: scrollTimelineToXPos / xPos_new = ${xPos_new}`
      );

      xPos_new = xPos_new;
      if (this.currentScrollEvent !== undefined) {
        this.currentScrollEvent();
        return;
      }

      this.currentScrollEvent = this.$scrollTo('.m_timeline', 500, {
        container: this.$refs.timeline,
        offset: xPos_new,
        cancelable: true,
        easing: [0.45, 0.8, 0.58, 1.0],
        x: true,
        y: false,
        onDone: () => {
          console.log(`METHODS • TimeLineView: scrollTimelineToXPos / is done`);
          this.currentScrollEvent = undefined;
          // onScroll will update view
        },
        onCancel: () => {
          console.log(
            `METHODS • TimeLineView: scrollTimelineToXPos / was canceled`
          );
          this.currentScrollEvent = undefined;
        }
      });
    },
    toggleSidebar() {
      console.log('METHODS • TimeLineView: toggleSidebar');
      this.$root.settings.has_sidebar_opened = !this.$root.settings
        .has_sidebar_opened;
      this.$nextTick(() => {
        this.updateViewerWidth();
      });
    },
    setVisibleDay(
      xPos = this.timelineViewport.scrollLeft +
        this.timelineViewport.viewerWidth / 2
    ) {
      console.log('METHODS • TimeLineView: setVisibleDay');
      let dateFromPosX = this.getDateFromXPosition(xPos);
      dateFromPosX = Math.min(
        this.timelineViewport.end,
        Math.max(dateFromPosX, this.timelineViewport.start)
      );
      if (dateFromPosX !== this.timelineViewport.visibleDay) {
        this.timelineViewport.visibleDay = dateFromPosX;
      }
    },
    showZoomZone(val) {
      this.zoomZone.display = true;
      this.zoomZone.width = Math.floor(
        val / this.timelineViewport.scale * this.timelineViewport.viewerWidth
      );
      this.zoomZone.xPos =
        this.timelineViewport.scrollLeft +
        this.timelineViewport.viewerWidth / 2 -
        this.zoomZone.width / 2 -
        this.timelineViewport.leftPadding;
    },
    hideZoomZone() {
      this.zoomZone.display = false;
      this.zoomZone.width = 0;
      this.zoomZone.xPos = 0;
    },

    updateTimelineViewportScale(val) {
      this.timelineViewport.scale = Number(val);
    },
    zoomZoneStyle() {
      return {
        width: `${this.zoomZone.width}px`,
        transform: `translate(${this.zoomZone.xPos}px, 0px)`
      };
    },
    startEditModal() {
      if (this.folder.authorized) {
        this.showEditFolderModal = true;
      }
    }
  }
};
</script>

<style lang="sass">
</style>
