<template>
  <div 
    class="m_mediaPublication"
    :style="`transform: translate(${mediaPos.x}px, ${mediaPos.y}px)`"
    :class="{ 'is--dragged' : is_dragged }"
    @mousedown.prevent="mousedown"
  >
    <!-- @click="updateMediaPosition({ x: Math.random() * 100, y: Math.random() * 100 })" -->
    <MediaContent
      :context="'full'"
      :slugMediaName="media.slugMediaName"
      :slugProjectName="media.slugProjectName"
      :media="media"
      :read_only="read_only"
      v-model="media.content"
    />
    <div class="m_mediaPublication--buttons">
      <button type="button" class="buttonLink" @click.stop="removeMedia()">
        Retirer
      </button>
    </div>
  </div>
</template>
<script>
import MediaContent from './MediaContent.vue';

export default {
  props: {
    media: Object,
    read_only: Boolean
  },
  components: {
    MediaContent
  },
  data() {
    return {
      is_dragged: false,
      dragOffset: {
        x: '',
        y: ''
      },

      mediaPos: {
        x: 0,
        y: 0,
        px: 0,
        py: 0
      }
    }
  },
  
  created() {
        this.updateMediaStyles();
  },
  mounted() {

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
  },
  methods: {
    updateMediaStyles() {
      this.mediaPos.x = this.media.publi_meta.hasOwnProperty('x') ? this.media.publi_meta.x : 5;
      this.mediaPos.y = this.media.publi_meta.hasOwnProperty('y') ? this.media.publi_meta.y : 5;
    },
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • TimelineMedia: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { reference_index: this.media.publi_meta.reference_index, val });
    },
    limitMediaXPos(xPos) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • TimelineMedia: limitMediaXPos / xPos = ${xPos}`);
      }
      return xPos;
      // return Math.max(100, Math.min(0, yPos));
    },
    limitMediaYPos(yPos) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • TimelineMedia: limitMediaYPos / yPos = ${yPos}`);
      }
      return yPos;
      // return Math.max(100, Math.min(0, yPos));
    },
    removeMedia() {
      this.$emit('removeMedia', { reference_index: this.media.publi_meta.reference_index });
    },

    mousedown(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(
          `METHODS • Publication: mousedown with is_dragged = ${
            this.is_dragged
          }`
        );
      }
      if (!this.read_only) {
        window.addEventListener('mousemove', this.mousemove);
        window.addEventListener('mouseup', this.mouseup);
      }
    },
    mousemove(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(
          `METHODS • Publication: mousemove with is_dragged = ${
            this.is_dragged
          }`
        );
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
    mouseup(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: mouseup`);
        console.log(`with is_dragged = ${this.is_dragged}`);
      }
      if (this.is_dragged) {
        this.updateMediaPubliMeta({ 
          x: this.mediaPos.x,
          y: this.mediaPos.y 
        });
        this.is_dragged = false;
      }

      event.stopPropagation();
      window.removeEventListener('mousemove', this.mousemove);
      window.removeEventListener('mouseup', this.mouseup);

      return false;
    },
  }
}
</script>
<style>

</style>