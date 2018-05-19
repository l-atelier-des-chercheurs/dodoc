<template>
  <div
    class="mediaContainer"
    :class="`type-${media.type}`"
    :data-context="context"
  >
  
    <template v-if="media.type === 'image'">
      <img :src="linkToImageThumb">
      <transition
        name="fade"
      >
        <img v-if="is_hovered && $root.state.is_electron" :src="linkToHoveredThumb">
      </transition>
    </template>

    <template v-else-if="media.type === 'video'">
      <template v-if="context === 'preview'">
        <img :src="linkToVideoThumb">
      </template>
      <template v-else>
        <video controls preload="none" :src="mediaURL" :poster="linkToVideoThumb">
        </video>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <audio controls :src="mediaURL">
      </audio>
    </template>

    <template v-else-if="media.type === 'text'">
      <div v-if="context !== 'edit'" class="padding-small font-small">
        <div v-if="value.length !== 0" v-html="value" />
        <p v-else v-html="'…'" />
      </div>
      <vue-editor 
        v-else
        v-model="htmlForEditor"
        ref="textField"
        autocorrect="off"
        :editorToolbar="customToolbar"
        class="mediaTextContent"
      />
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

    <template v-else-if="media.type === 'other'">
      <div class="padding-small font-small">
        <pre>
Fichier&nbsp;:
{{ slugMediaName }}
        </pre>
      </div>
    </template>
  </div>
</template>
<script>
import _ from 'underscore';
import { VueEditor } from 'vue2-editor'

// is loaded by Media and by EditMedia

export default {
  props: {
    slugMediaName: String,
    slugProjectName: String,
    media: Object,
    context: {
      type: String,
      default: 'preview'
      // preview, edit, publication
    },
    value: {
      type: String,
      default: '…'
    },
    is_hovered: Boolean,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    VueEditor
  },
  data() {
    return {
      available_resolutions: {
        preview: 360,
        preview_hovered: 600,
        default: 1600
      },
      htmlForEditor: this.value,
      mediaURL: `/${this.slugProjectName}/${this.slugMediaName}`,
      customToolbar: [
        [{ 'header': [false, 1, 2, 3, 4] }],
        // [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }, { 'header': 4 }],
        ['bold', 'italic', 'underline'],
        ['clean']  
      ]
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
  },
  watch: {
    'htmlForEditor': function() {
      this.$emit('input', this.htmlForEditor);
    }
  },
  computed: {
    thumbRes: function() {
      return this.context === 'preview'
        ? this.available_resolutions.preview
        : this.available_resolutions.default;
    },
    thumbResHovered: function() {
      return this.available_resolutions.preview_hovered;
    },
    linkToImageThumb: function() {
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, {
        size: this.thumbRes
      }).path;

      if (
      // if image is gif and context is not 'preview', let’s show the original gif
        (this.context !== 'preview' &&
        this.mediaURL.toLowerCase().endsWith('.gif'))
        ||
        pathToSmallestThumb === undefined
      ) {
        return this.mediaURL;
      }


      return pathToSmallestThumb !== undefined
        ? '/' + pathToSmallestThumb
        : this.mediaURL;
    },
    linkToHoveredThumb: function() {
      let pathToSmallestThumb = _.findWhere(this.media.thumbs, {
        size: this.thumbResHovered
      }).path;
      return pathToSmallestThumb !== undefined
        ? '/' + pathToSmallestThumb
        : this.mediaURL;
    },
    linkToVideoThumb: function() {
      if (typeof this.media.thumbs === 'null' || this.media.thumbs.length === 0) {
        return;
      }

      let timeMark = 0;
      let timeMarkThumbs = _.findWhere(this.media.thumbs, { timeMark });

      if (timeMarkThumbs.length === 0) {
        return;
      }

      let pathToSmallestThumb = _.findWhere(timeMarkThumbs.thumbsData, {
        size: this.thumbRes
      }).path;
      return pathToSmallestThumb !== undefined
        ? '/' + pathToSmallestThumb
        : this.mediaURL;
    }
  }
};
</script>
