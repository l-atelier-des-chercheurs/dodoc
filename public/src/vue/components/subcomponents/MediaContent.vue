<template>
  <div
    class="mediaContainer"
    :class="`type-${media.type}`"
    :data-context="context"
  >
    <template v-if="media.type === 'image'">
      <img :srcset="imageSrcSetAttr" :sizes="imageSizesAttr" :src="linkToImageThumb" draggable="false">
      <transition name="fade" :duration="600">
        <img v-if="is_hovered && $root.state.is_electron && linkToHoveredThumb" :src="linkToHoveredThumb" draggable="false">
      </transition>
    </template>

    <template v-else-if="media.type === 'video'">
      <template v-if="context === 'preview'">
        <img :srcset="videostillSrcSetAttr" :sizes="imageSizesAttr" :src="linkToVideoThumb" draggable="false">
        <div class="play_picto">
          <svg class="" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="169px"
            height="169px" viewBox="0 0 169 169" style="enable-background:new 0 0 169 169;" xml:space="preserve">
            <path d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"/>
          </svg>
        </div>
      </template>
      <template v-else>
        <vue-plyr :options="plyr_options" ref="plyr"
          :emit="['volumechange']" @volumechange="volumeChanged"
        >
          <video :poster="linkToVideoThumb" :src="mediaURL" preload="none" :autoplay="autoplay" />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <template v-if="context === 'preview'">
        <div class="play_picto">
          <svg class="" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="169px"
            height="169px" viewBox="0 0 169 169" style="enable-background:new 0 0 169 169;" xml:space="preserve">
            <path d="M53.2,138.4c-4.6,3-8.4,0.9-8.4-4.6V30.4c0-5.5,3.8-7.6,8.4-4.6l78.5,50.9c4.6,3,4.6,7.9,0,10.9L53.2,138.4z"/>
          </svg>
        </div>
      </template>
      <template v-else>
        <vue-plyr :options="plyr_options">
          <audio :src="mediaURL" preload="none" :autoplay="autoplay" />
        </vue-plyr>
      </template>
    </template>

    <template v-else-if="media.type === 'text'">
      <CollaborativeEditor 
        v-if="context === 'edit'"
        v-model="htmlForEditor"
        :media="media"
        :slugFolderName="slugFolderName"
        ref="textField"
      />
      <div v-else class="mediaTextContent">
        <div v-if="value.length !== 0" v-html="value" />
        <p v-else v-html="'…'" />
      </div>
      <!-- <textarea
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        autocorrect="on"
        :readonly="read_only"
      /> -->
    </template>

    <template v-else-if="media.type === 'marker'">
      <div v-if="context !== 'edit'" class="padding-small">
        <template v-if="value.length > 0">
          {{ value }}
        </template>
        <template v-else>
          …
        </template>
      </div>

      <input
        v-else
        type="text"
        class="border-none bg-transparent"
        placeholder="Étiquette"
        name="label"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        :readonly="read_only"
      >
    </template>

    <template v-else-if="media.type === 'document'">
      <div v-if="context !== 'edit' && context !== 'full'" class="padding-small font-verysmall">
        <pre>{{ media.media_filename }}
        </pre>
      </div>
      <iframe v-else :src="mediaURL" />
    </template>

    <template v-else-if="media.type === 'other'">
      <div class="padding-small font-verysmall">
        <pre>{{ media.media_filename }}</pre>
      </div>
    </template>

  </div>
</template>
<script>
import CollaborativeEditor from './CollaborativeEditor.vue'

export default {
  props: {
    slugFolderName: String,
    media: Object,
    subfolder: {
      type: String,
      default: ''
    },
    context: {
      type: String,
      default: 'preview'
      // preview, edit, publication
    },
    autoplay: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: '…'
    },
    is_hovered: Boolean,
    read_only: {
      type: Boolean,
      default: true
    },
    preview_size: {
      type: Number,
      default: 180
    },
    element_width_for_sizes: {
      type: Number,
      default: 0
    },
    element_height: {
      type: Number,
      default: 0
    },
    audio_volume: {
      type: Number,
      default: 100
    }
  },
  components: {
    CollaborativeEditor
  },
  data() {
    return {
      available_resolutions: {
        preview_hovered: 360,
        default: 1600
      },
      htmlForEditor: this.value,

      plyr_options: {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        iconUrl: this.$root.state.mode === 'export_publication' ? `./_images/plyr.svg` : `/images/plyr.svg`
      }
    };
  },
  mounted() {
    if (this.context === 'edit') {
      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if (this.$refs.textField !== undefined) {
          // this.$refs.textField.focus();
        }
      }
    }
    this.setVolume(this.audio_volume);
  },
  beforeDestroy() {
  },
  watch: {
    'htmlForEditor': function() {
      this.$emit('input', this.htmlForEditor);
    }
  },
  computed: {
    mediaURL: function() {
      return this.$root.state.mode === 'export_publication' 
        ? `./${this.subfolder}${this.slugFolderName}/${this.media.media_filename}` 
        : `/${this.subfolder}${this.slugFolderName}/${this.media.media_filename}`;
    },
    thumbRes: function() {
      return this.context === 'preview'
        ? this.preview_size
        : this.available_resolutions.default;
    },
    thumbResHovered: function() {
      return this.available_resolutions.preview_hovered;
    },
    linkToImageThumb: function() {
      if(
        !this.media.hasOwnProperty('thumbs')
      ) {
        return this.mediaURL;
      }
      
      if (
      // if image is gif and context is not 'preview', let’s show the original gif
        (this.context !== 'preview' &&
        this.mediaURL.toLowerCase().endsWith('.gif'))
      ) {
        return this.mediaURL;
      }

      const small_thumb = this.media.thumbs.filter(m => m.size === this.thumbRes);
      if(small_thumb.length == 0) {
        return this.mediaURL;
      }

      let pathToSmallestThumb = small_thumb[0].path;

      let url = this.$root.state.mode === 'export_publication' ? `./${pathToSmallestThumb}` : `/${pathToSmallestThumb}`;
      return url;
    },
    imageSrcSetAttr: function() {
      if (this.element_width_for_sizes === 0 
        || this.mediaURL.toLowerCase().endsWith('.gif')
        || this.context === 'full'
      ) {
        return;
      }
      
      // get all available sizes 
      const img_srcset = this.media.thumbs.reduce((acc, t) => {
        if(t.hasOwnProperty('path')) {
          // acc.push(encodeURIComponent(t.path) + ' ' + t.size + 'w');
          acc.push(t.path + ' ' + t.size + 'w');
        }
        return acc;
      }, []);
      return img_srcset.join(', ');
    },
    videostillSrcSetAttr: function() {
      if(this.element_width_for_sizes === 0) {
        return;
      }

      let timeMark = 0;
      let timeMarkThumbs = this.media.thumbs.filter(t => !!t && t.timeMark === 0);

      if (!timeMarkThumbs || timeMarkThumbs.length === 0) {
        return;
      }

      // get all available sizes 
      const img_srcset = timeMarkThumbs[0].thumbsData.reduce((acc, t) => {
        if(t.hasOwnProperty('path')) {
          acc.push(t.path + ' ' + t.size + 'w');
        }
        return acc;
      }, []);
      
      return img_srcset.join(', ');
    },
    imageSizesAttr: function() {
      if(this.element_width_for_sizes === 0) {
        return;
      }
      return this.element_width_for_sizes + 'px';
    },
    linkToHoveredThumb: function() {
      let pathToSmallestThumb = this.media.thumbs.filter(m => m.size === this.thumbResHovered)[0].path;

      const url = this.$root.state.mode === 'export_publication' ? './' + pathToSmallestThumb : '/' + pathToSmallestThumb;
      return pathToSmallestThumb !== undefined
        ? url
        : this.mediaURL;
    },
    linkToVideoThumb: function() {
      if (!this.media['thumbs'] || typeof this.media.thumbs === 'object' && this.media.thumbs.length === 0) {
        return this.mediaURL;
      }

      let timeMark = 0;
      let timeMarkThumbs = this.media.thumbs.filter(t => !!t && t.timeMark === 0);

      if (!timeMarkThumbs || timeMarkThumbs.length === 0) {
        return this.mediaURL;
      }

      let pathToSmallestThumb = timeMarkThumbs[0].thumbsData.filter(m => m.size === this.thumbRes)[0].path;

      let url = this.$root.state.mode === 'export_publication' ? './' + pathToSmallestThumb : '/' + pathToSmallestThumb;
      return pathToSmallestThumb !== undefined
        ? url
        : this.mediaURL;
    },
  },
  methods: {
    volumeChanged(event) {
      const vol = Math.round(Number(event.detail.plyr.volume) * 100);
      this.$emit('volumeChanged', vol);
    },
    setVolume(val) {
      if(this.$refs.hasOwnProperty('plyr')) {
        this.$refs.plyr.player.volume = val / 100;
      }
    }
  }
};
</script>
