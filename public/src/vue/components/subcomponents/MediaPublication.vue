<template>
  <div 
    class="m_mediaPublication"
    :style="mediaStyles"
    @mouseover="is_hovered = true"
    @mouseleave="is_hovered = false"
    :class="{ 
      'is--dragged' : is_dragged, 
      'is--resized' : is_resized, 
      'is--waitingForServerResponse' : is_waitingForServer,
      'is--hovered' : is_hovered
    }"
    @mousedown.stop.prevent="dragMedia('mouse')"
    @touchstart.stop.prevent="dragMedia('touch')"
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
      v-if="preview_mode === false" 
      class="resizeFrame"
    >
      <div class="handle handle_bottomright"
        @mousedown.stop="resizeMedia('mouse', 'bottomright')"
        @touchstart.stop.prevent="resizeMedia('touch', 'bottomright')"
      >
      </div>
    </div>

    <div 
      v-if="preview_mode === false" 
      class="m_mediaPublication--buttons"
    >
      <button 
        type="button" 
        class="buttonLink" 
        @click.stop="$root.showMediaModalFor({ slugProjectName: media.slugProjectName, slugMediaName: media.slugMediaName })"
        @touchend.stop="$root.showMediaModalFor({ slugProjectName: media.slugProjectName, slugMediaName: media.slugMediaName })"
      >
        Modifier
      </button>
      <button 
        type="button" 
        class="buttonLink" 
        @click.stop="removeMedia()"
        @touchend.stop="removeMedia()"
      >
        Enlever
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
    pixelsPerMillimeters: Number
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
      }
    },
    resizeUp(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: resizeUp with is_resized = ${this.is_resized}`);
      }
      if (this.is_resized) {
        this.mediaSize.width = this.roundMediaVal(this.mediaSize.width);
        this.mediaSize.height = this.roundMediaVal(this.mediaSize.height);

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
          window.addEventListener('mousemove', this.dragMove);
          window.addEventListener('mouseup', this.dragUp);
        } else if(type === 'touch') {
          window.addEventListener('touchmove', this.dragMove);
          window.addEventListener('touchend', this.dragUp);
        }
      }
    },
    dragMove() {
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
      }
    },
    dragUp() {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: dragUp with is_dragged = ${this.is_dragged}`);
      }
      if (this.is_dragged) {
        this.mediaPos.x = this.roundMediaVal(this.mediaPos.x - this.page.margin_left) + this.page.margin_left;
        this.mediaPos.y = this.roundMediaVal(this.mediaPos.y - this.page.margin_top) + this.page.margin_top;
        
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