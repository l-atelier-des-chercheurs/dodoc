<template>
  <div 
    class="m_mediaPublication"
    :style="mediaStyles"
    @mouseover="is_hovered = true"
    @mouseleave="is_hovered = false"
    :class="{ 
      'is--dragged' : is_dragged, 
      'is--waitingForServerResponse' : is_waitingForServer,
      'is--hovered' : is_hovered
    }"
    @mousedown.stop.prevent="dragMedia('mouse')"
    @touchstart.stop.prevent="dragMedia('touch')"
  >
    <MediaContent
      :context="'full'"
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
        @touchstart.stop="$root.showMediaModalFor({ slugProjectName: media.slugProjectName, slugMediaName: media.slugMediaName })"
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

export default {
  props: {
    media: Object,
    page: Object,
    read_only: Boolean,
    preview_mode: Boolean
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

      pageProperties: {
        x_margin: 38,
        y_margin: 38,
        w: 794,
        h: 1122
      },

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
        transform: translate(${this.mediaPos.x}px, ${this.mediaPos.y}px);
        width: ${this.mediaSize.width}px;
        height: ${this.mediaSize.height}px;
      `
      ;
    },
  },
  methods: {
    updateMediaStyles() {
      this.mediaPos.x = this.media.publi_meta.hasOwnProperty('x') ? this.limitMediaXPos(this.media.publi_meta.x) : this.pageProperties.x_margin;
      this.mediaPos.y = this.media.publi_meta.hasOwnProperty('y') ? this.limitMediaYPos(this.media.publi_meta.y) : this.pageProperties.y_margin;
      this.mediaSize.width = this.media.publi_meta.hasOwnProperty('width') ? this.media.publi_meta.width : 300;
      this.mediaSize.height = this.media.publi_meta.hasOwnProperty('height') ? this.media.publi_meta.height : 300;
    },
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { reference_index: this.media.publi_meta.reference_index, val });
    },
    limitMediaXPos(xPos) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: limitMediaXPos / xPos = ${xPos}`);
      }
      return Math.max(this.pageProperties.x_margin, Math.min(this.pageProperties.w - this.pageProperties.x_margin - this.mediaSize.width, xPos));
    },
    limitMediaYPos(yPos) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: limitMediaYPos / yPos = ${yPos}`);
      }
      return Math.max(this.pageProperties.y_margin, Math.min(this.pageProperties.h - this.pageProperties.y_margin - this.mediaSize.height, yPos));
    },
    limitMediaWidth(w) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: limitMediaWidth / w = ${w}`);
      }
      return Math.max(0, Math.min(this.pageProperties.w - this.pageProperties.x_margin - this.mediaPos.x, w));
    },
    limitMediaHeight(h) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • MediaPublication: limitMediaHeight / h = ${h}`);
      }
      return Math.max(0, Math.min(this.pageProperties.h - this.pageProperties.y_margin - this.mediaPos.y, h));
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
      if (!this.is_resized) {
        this.is_resized = true;
        this.resizeOffset.x = event.pageX;
        this.resizeOffset.y = event.pageY;

        this.mediaSize.pwidth = Number.parseInt(this.mediaSize.width);
        this.mediaSize.pheight = Number.parseInt(this.mediaSize.height);
      } else {
        const deltaX = (event.pageX - this.resizeOffset.x);
        let newWidth = this.mediaSize.pwidth + deltaX;
        this.mediaSize.width = this.limitMediaWidth(newWidth);

        const deltaY = (event.pageY - this.resizeOffset.y);
        let newHeight = this.mediaSize.pheight + deltaY;
        this.mediaSize.height = this.limitMediaHeight(newHeight);
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
      if (!this.is_dragged) {
        this.is_dragged = true;
        this.dragOffset.x = event.pageX;
        this.dragOffset.y = event.pageY;

        this.mediaPos.px = Number.parseInt(this.mediaPos.x);
        this.mediaPos.py = Number.parseInt(this.mediaPos.y);
      } else {
        const deltaX = (event.pageX - this.dragOffset.x);
        let newX = this.mediaPos.px + deltaX;
        this.mediaPos.x = this.limitMediaXPos(newX);

        const deltaY = (event.pageY - this.dragOffset.y);
        let newY = this.mediaPos.py + deltaY;
        this.mediaPos.y = this.limitMediaYPos(newY);
      }
    },
    dragUp() {
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