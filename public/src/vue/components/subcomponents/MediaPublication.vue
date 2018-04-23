<template>
  <div 
    class="m_mediaPublication"
    :style="`transform: translate(${mediaStyles.x}mm, ${mediaStyles.y}mm)`"
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
    <button type="button" @click.stop="removeMedia()">
      retirer
    </button>
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
      mediaStylesOld: {
        x: '',
        y: ''
      },
      mediaStyles: {
        x: 0,
        y: 0
        // y: this.limitMediaYPos(parseFloat(this.media.y !== undefined ? this.media.y : 1)),
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
      this.mediaStyles.x = this.media.publi_meta.hasOwnProperty('x') ? this.media.publi_meta.x : 5;
      this.mediaStyles.y = this.media.publi_meta.hasOwnProperty('y') ? this.media.publi_meta.y : 5;
    },
    updateMediaPubliMeta(val) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • TimelineMedia: updateMediaPubliMeta`);
      }
      this.$emit('editPubliMedia', { reference_index: this.media.publi_meta.reference_index, val });
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

        this.dragOffset.y = event.pageY;
        this.mediaStylesOld.y = this.mediaStyles.y;
      } else {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = this.limitMediaYPos(newY);
      }
    },
    // openMedia() {
    //   if (this.is_dragged) {
    //     return;
    //   }
    //   if (this.$root.state.dev_mode === 'debug') {
    //     console.log('METHODS • Publication: openMedia');
    //   }
    //   this.$emit('open');
    // },
    mouseup(event) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log(`METHODS • Publication: mouseup`);
        console.log(`with is_dragged = ${this.is_dragged}`);
      }
      if (this.is_dragged) {
        let newY = this.mediaStylesOld.y + event.pageY - this.dragOffset.y;
        this.mediaStyles.y = this.limitMediaYPos(newY);

        this.updateMediaPubliMeta(this.mediaStyles);

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