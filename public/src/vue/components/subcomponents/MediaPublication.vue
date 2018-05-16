<template>
  <div 
    class="m_mediaPublication"
    :style="mediaStyles"
    @mouseover="is_hovered = true"
    @mouseleave="is_hovered = false"
    @mousedown.stop.prevent="dragMedia('mouse')"
    @touchstart.stop.prevent="dragMedia('touch')"    
    :class="{ 
      'is--dragged' : is_dragged, 
      'is--resized' : is_resized, 
      'is--waitingForServerResponse' : is_waitingForServer,
      'is--hovered' : is_hovered
    }"
  >
    <MediaContent
      :context="'publication'"
      :slugMediaName="media.slugMediaName"
      :slugProjectName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      v-model="media.content"
    />
    <p class="m_mediaPublication--caption">{{ media.caption }}</p>

    <div 
      v-if="is_selected" 
      class="controlFrame"
    >
      <div class="handle handle_resizeMedia"
        @mousedown.stop="resizeMedia('mouse', 'bottomright')"
        @touchstart.stop.prevent="resizeMedia('touch', 'bottomright')"
      >
        <svg version="1.1"
          xmlns="http://www.w3.org/2000/svg" 
          xmlns:xlink="http://www.w3.org/1999/xlink" 
          xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px" y="0px" width="77.5px" height="77.5px" viewBox="0 0 77.5 77.5" style="enable-background:new 0 0 77.5 77.5;"
          xml:space="preserve">
        <defs>
        </defs>
        <g>
          <path d="M42.5,0l0.4,12.6l-9.3,0.1c-2.8,0-5.1,0-6.9-0.2c-1.8-0.2-3.6-0.6-5.7-1.2l45.3,45.3c-0.6-2-1-3.9-1.2-5.7
            c-0.2-1.8-0.3-4-0.2-6.9v-9.4l12.6,0.4l-1.3,41.2l-41.2,1.3l-0.4-12.6l9.5,0c2.9,0,5.2,0.1,7,0.3c1.8,0.2,3.6,0.5,5.4,1.1
           L11.3,21.1c0.5,1.8,0.9,3.6,1.1,5.4c0.2,1.8,0.3,4.1,0.3,7l-0.1,9.4L0,42.5L1.3,1.3L42.5,0z"/>
        </g>
        </svg>
      </div>
      <!-- <div class="handle handle_moveMedia"
        @mousedown.stop.prevent="dragMedia('mouse')"
        @touchstart.stop.prevent="dragMedia('touch')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
          version="1.1" 
          id="Layer_1" 
          x="0px" y="0px" width="100px" height="100px" viewBox="5.0 -10.0 100.0 135.0" 
          enable-background="new 0 0 100 100" xml:space="preserve"> 
          <path d="M19.333,93.828c-3.866,0-7-3.135-7-7V13.172c0-3.866,3.134-7,7-7s7,3.134,7,7v73.656 C26.333,90.693,23.199,93.828,19.333,93.828z"></path> 
          <path d="M50,93.828c-3.866,0-7-3.135-7-7V13.172c0-3.866,3.134-7,7-7s7,3.134,7,7v73.656C57,90.693,53.866,93.828,50,93.828z"></path>
          <path d="M80.667,93.828c-3.866,0-7-3.135-7-7V13.172c0-3.866,3.134-7,7-7s7,3.134,7,7v73.656  C87.667,90.693,84.533,93.828,80.667,93.828z"></path>
        </svg>
      </div> -->
    </div>

    <div 
      v-if="is_selected" 
      class="m_mediaPublication--buttons"
    >
      <button 
        type="button" 
        class="buttonLink" 
        @click.stop="$root.showMediaModalFor({ slugProjectName: media.slugProjectName, slugMediaName: media.slugMediaName })"
        @touchend.stop="$root.showMediaModalFor({ slugProjectName: media.slugProjectName, slugMediaName: media.slugMediaName })"
      >
        {{ $t('edit') }}
      </button>
      <button 
        type="button" 
        class="buttonLink" 
        @click.stop="removeMedia()"
        @touchend.stop="removeMedia()"
      >
        {{ $t('remove') }}
      </button>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';
import toPx from 'unit-to-px';

export default {
  props: {
    media: Object,
    page: Object,
    read_only: Boolean,
    preview_mode: Boolean,
    pixelsPerMillimeters: Number,
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_dragged: false,
      is_resized: false,
      is_waitingForServer: false,
      is_hovered: false,
      is_selected: false,

      dragOffset: {
        x: 0,
        y: 0
      },
      mediaPos: {
        x: 0,
        y: 0,
        px: 0,
        py: 0
      },

      resizeOffset: {
        x: 0,
        y: 0
      },
      mediaSize: {
        width: 0,
        height: 0,
        pwidth: 0,
        pheight: 0
      },
    }
  },
  
  created() {
  },
  mounted() {
    this.updateMediaStyles();
  },
  beforeDestroy() {
  },

  watch: {
    'media.publi_meta': { 
      handler: function() {
        this.updateMediaStyles();
      },
      deep: true
    },
  },
  computed: {
    mediaStyles() {
      return `
        transform: translate(${this.mediaPos.x}mm, ${this.mediaPos.y}mm);
        width: ${this.mediaSize.width}mm;
        height: ${this.mediaSize.height}mm;
      `
      ;
    },
  },
  methods: {
    updateMediaStyles() {
      this.mediaPos.x = this.media.publi_meta.hasOwnProperty('x') && !!Number.parseInt(this.media.publi_meta.x) ? this.limitMediaXPos(Number.parseInt(this.media.publi_meta.x)) : this.page.margin_left;
      this.mediaPos.y = this.media.publi_meta.hasOwnProperty('y') && !!Number.parseInt(this.media.publi_meta.y) ? this.limitMediaYPos(Number.parseInt(this.media.publi_meta.y)) : this.page.margin_top;
      this.mediaSize.width = this.media.publi_meta.hasOwnProperty('width') && !!Number.parseInt(this.media.publi_meta.width) ? this.limitMediaWidth(Number.parseInt(this.media.publi_meta.width)) : 100;
      this.mediaSize.height = this.media.publi_meta.hasOwnProperty('height') && !!Number.parseInt(this.media.publi_meta.height) ? this.limitMediaHeight(Number.parseInt(this.media.publi_meta.height)) : 100;
    },
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { reference_index: this.media.publi_meta.reference_index, val });
    },
    limitMediaXPos(xPos) {
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaXPos / xPos = ${xPos}`);
      // }
      return Math.max(this.page.margin_left, Math.min(this.page.width - this.page.margin_right - this.mediaSize.width, xPos));
    },
    roundMediaVal(val) {
      return Math.round(val / this.page.gridstep) * this.page.gridstep;
    },

    limitMediaYPos(yPos) {
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaYPos / yPos = ${yPos}`);
      // }
      yPos = Math.max(this.page.margin_top, Math.min(this.page.height - this.page.margin_bottom - this.mediaSize.height, yPos));
      return yPos;
    },
    
    limitMediaWidth(w) {
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaWidth / w = ${w}`);
      // }
      return Math.max(20, Math.min(this.page.width - this.page.margin_right - this.mediaPos.x, w));
    },
    limitMediaHeight(h) {
      // if (this.$root.state.dev_mode === 'debug') {
      //   console.log(`METHODS • MediaPublication: limitMediaHeight / h = ${h}`);
      // }
      return Math.max(20, Math.min(this.page.height - this.page.margin_bottom - this.mediaPos.y, h));
;
    },
    
    removeMedia() {
      this.$emit('removeMedia', { reference_index: this.media.publi_meta.reference_index });
    },
    resizeMedia(type, origin) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeMedia with is_resized = ${this.is_resized}`);
      }
      if (!this.read_only) {
        if(type === 'mouse') {
          window.addEventListener('mousemove', this.resizeMove);
          window.addEventListener('mouseup', this.resizeUp);
        } else if(type === 'touch') {
          window.addEventListener('touchmove', this.resizeMove);
          window.addEventListener('touchend', this.resizeUp);
        }
      }
    },
    resizeMove(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeMove with is_resized = ${this.is_resized}`);
      }
      const pageX_mm = event.pageX / this.pixelsPerMillimeters;
      const pageY_mm = event.pageY / this.pixelsPerMillimeters;

      if (!this.is_resized) {
        this.is_resized = true;
        this.resizeOffset.x = pageX_mm;
        this.resizeOffset.y = pageY_mm;
        this.mediaSize.pwidth = Number.parseInt(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseInt(this.mediaSize.height);
      } else {
        const deltaX = (pageX_mm - this.resizeOffset.x);
        let newWidth = this.mediaSize.pwidth + deltaX;
        this.mediaSize.width = this.limitMediaWidth(newWidth);

        const deltaY = (pageY_mm - this.resizeOffset.y);
        let newHeight = this.mediaSize.pheight + deltaY;
        this.mediaSize.height = this.limitMediaHeight(newHeight);

        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`);
      }
      if (this.is_resized) {
        this.updateMediaPubliMeta({ 
          width: this.mediaSize.width,
          height: this.mediaSize.height 
        });
        this.is_resized = false;
      }

      event.stopPropagation();
      window.removeEventListener('mousemove', this.resizeMove);
      window.removeEventListener('mouseup', this.resizeUp);
      window.removeEventListener('touchmove', this.resizeMove);
      window.removeEventListener('touchend', this.resizeUp);

      return false;
    },

    dragMedia(type) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: dragMedia with is_dragged = ${this.is_dragged}`);
      }
      if (!this.read_only) {
        if(type === 'mouse') {
          this.is_selected = true;
          window.addEventListener('mousemove', this.dragMove);
          window.addEventListener('mouseup', this.dragUp);
        } else if(type === 'touch') {
          
          if(is_selected) {
            window.addEventListener('touchmove', this.dragMove);
            window.addEventListener('touchend', this.dragUp);
          }
        }
      }
    },
    dragMove(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: dragMove with is_dragged = ${this.is_dragged}`);
      }

      const pageX_mm = event.pageX / this.pixelsPerMillimeters;
      const pageY_mm = event.pageY / this.pixelsPerMillimeters;

      if (!this.is_dragged) {
        this.is_dragged = true;

        this.dragOffset.x = pageX_mm;
        this.dragOffset.y = pageY_mm;

        this.mediaPos.px = Number.parseInt(this.mediaPos.x);
        this.mediaPos.py = Number.parseInt(this.mediaPos.y);
      } else {
        const deltaX = (pageX_mm - this.dragOffset.x);
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY = (pageY_mm - this.dragOffset.y);
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);        

        this.mediaPos.x = this.roundMediaVal(this.mediaPos.x - this.page.margin_left) + this.page.margin_left;
        this.mediaPos.y = this.roundMediaVal(this.mediaPos.y - this.page.margin_top) + this.page.margin_top;
      }
    },
    dragUp(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: dragUp with is_dragged = ${this.is_dragged}`);
      }
      if (this.is_dragged) {        
        this.updateMediaPubliMeta({ 
          x: this.mediaPos.x,
          y: this.mediaPos.y 
        });
        this.is_dragged = false;
      }

      event.stopPropagation();
      window.removeEventListener('mousemove', this.dragMove);
      window.removeEventListener('mouseup', this.dragUp);
      window.removeEventListener('touchmove', this.dragMove);
      window.removeEventListener('touchend', this.dragUp);

      return false;
    },
  }
}
</script>
<style>

</style>