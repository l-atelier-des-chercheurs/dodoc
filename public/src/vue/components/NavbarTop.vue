<template>
  <nav class="m_navbar font-small">
    <div class="wrapper bg-noir">
      <div class="bloccontainer">

        <div class="breadcrumb padding-none">
          <template v-if="$root.state.mode !== 'export'">
            <a 
            href="/" 
            @click.prevent="$root.closeFolder()" 
            class="breadcrumb--item font-verylarge padding-left-small"
            >
              <svg version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px" y="0px" width="17px" height="17.9px" viewBox="0 0 17 17.9" xml:space="preserve">
              <defs>
              </defs>
              <g>
                <polyline class="st0" points="8.6,15.8 1.4,8.3 8.6,0.7 	" style="fill:none;stroke:#FFFFFF;stroke-miterlimit:10; stroke-width: 1;" />
              </g>
              </svg>
            </a>

            <button class="menu_icon padding-right-small" @click.prevent="$root.closeFolder()">
              <svg class="svg-icon" version="1.1"
                xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40.5px" height="26.1px"
              viewBox="0 0 40.5 26.1"
                style="enable-background:new 0 0 40.5 26.1;" xml:space="preserve"
              >
                <g>
                    <path class="st0" d="M37.2,7.1c-0.7,6.7-7,16-13.2,16c-1.9,0-3.2-2.5-3.2-6c0-7.8,5.5-11.8,5.5-15.4c0-1-0.7-1.7-1.7-1.7
  c-1.3,0-2.4,0.5-5,1.9L15,4.3l1.1,2.3L23.1,3c-4,5.7-5.5,10.4-5.5,14.3c0,3.2,1.2,8.8,5.8,8.8c8.4,0,17.1-12.1,17.1-21.3
  c0-3.3-1.5-4.8-3.6-4.8c-2,0-3.5,1.5-3.5,3.5C33.4,5.8,35.2,7.1,37.2,7.1 M0,21.4c0,2.8,2,4.7,4.6,4.7c2.6,0,4.8-1.9,4.8-4.7
  c0-2.7-2.1-4.7-4.8-4.7C2,16.6,0,18.7,0,21.4" style="fill:#FFFFFF"/>
                </g>
              </svg>
            </button>
          </template>
          <template v-else>
            <div class="menu_icon padding-right-small padding-sides-small">
              <svg class="svg-icon" version="1.1"
                xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40.5px" height="26.1px"
              viewBox="0 0 40.5 26.1"
                style="enable-background:new 0 0 40.5 26.1;" xml:space="preserve"
              >
                <path class="st0" d="M37.2,7.1c-0.7,6.7-7,16-13.2,16c-1.9,0-3.2-2.5-3.2-6c0-7.8,5.5-11.8,5.5-15.4c0-1-0.7-1.7-1.7-1.7
c-1.3,0-2.4,0.5-5,1.9L15,4.3l1.1,2.3L23.1,3c-4,5.7-5.5,10.4-5.5,14.3c0,3.2,1.2,8.8,5.8,8.8c8.4,0,17.1-12.1,17.1-21.3
c0-3.3-1.5-4.8-3.6-4.8c-2,0-3.5,1.5-3.5,3.5C33.4,5.8,35.2,7.1,37.2,7.1 M0,21.4c0,2.8,2,4.7,4.6,4.7c2.6,0,4.8-1.9,4.8-4.7
c0-2.7-2.1-4.7-4.8-4.7C2,16.6,0,18.7,0,21.4" style="fill:#FFFFFF"/>
              </svg>
            </div>
          </template>
<!--
          <a href="/" @click.prevent="$root.closeFolder()" class="breadcrumb--item padding-small">
            <i>Les Cahiers du Studio</i>
          </a>
-->
          <div class="breadcrumb--item padding-small"  v-if="typeof folder !== 'undefined'">{{ folder.name }}</div>
        </div>

        <div class="visibleDay padding-none" v-if="typeof visibleDay !== 'undefined'">
          <button class="bg-transparent" @click.prevent="goToPrevDay()">‹</button>
            {{ getVisibleDay }}
          <button class="bg-transparent" @click.prevent="goToNextDay()">›</button>
        </div>

        <div class="scaleSwitch padding-none">
          <span class="padding-small" v-html="$t('scale')">
          </span>
          <template v-for="(btns, index) in scaleBtns">
            <button type="button"
              class="bg-noir border-circled button-thin button-wide padding-verysmall margin-verysmall"
              :class="{ 'is--active' : timelineViewport_scale === btns.scale }"
              @click="updateScale(Number(btns.scale))"
              @mouseover="showZoomZone(Number(btns.scale))"
              @mouseleave="hideZoomZone()"
              :key="index"
              >
              {{ btns.name }}
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
<script>
export default {
  props: {
    folder: Object,
    slugFolderName: String,
    visibleDay: Number,
    timelineViewport_scale: Number
  },
  components: {},
  data() {
    return {
      scaleBtns: [
        {
          name: this.$t('scale_items.second'),
          scale: 1
        },
        {
          name: this.$t('scale_items.minute'),
          scale: 8
        },
        {
          name: this.$t('scale_items.hour'),
          scale: 20
        },
        {
          name: this.$t('scale_items.half_day'),
          scale: 50
        },
        {
          name: this.$t('scale_items.day'),
          scale: 100
        }
      ]
    };
  },
  computed: {
    getVisibleDay: function() {
      return `${this.$moment(this.visibleDay).format('LL')}`;
    }
  },
  methods: {
    updateScale: function(val) {
      this.$eventHub.$emit('updateScale', val);
    },
    goToPrevDay: function() {
      this.$eventHub.$emit('goToPrevDay');
    },
    goToNextDay: function() {
      this.$eventHub.$emit('goToNextDay');
    },
    showZoomZone: function(val) {
      this.$eventHub.$emit('timeline.showZoomZone', val);
    },
    hideZoomZone: function() {
      this.$eventHub.$emit('timeline.hideZoomZone');
    }
  }
};
</script>
<style scoped lang="">

</style>