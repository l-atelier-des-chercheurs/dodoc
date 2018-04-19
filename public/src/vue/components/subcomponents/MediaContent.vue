<template>
  <div
    class="mediaContainer flex-wrap flex-vertically-centered"
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
        <video controls :src="mediaURL" :poster="linkToVideoThumb">
        </video>
      </template>
    </template>

    <template v-else-if="media.type === 'audio'">
      <audio controls :src="mediaURL">
      </audio>
    </template>

    <template v-else-if="media.type === 'text'">
      <div v-if="context !== 'edit'" class="padding-small font-small">
        <template v-if="value.length !== 0">
          {{ value }}
        </template>
        <template v-else>
          …
        </template>
      </div>
      <textarea
        v-else
        placeholder="…"
        class="mediaTextContent border-none bg-transparent"
        :value="value"
        @input="$emit('input', $event.target.value)"
        ref="textField"
        autocorrect="on"
        :readonly="read_only"
      >
      </textarea>
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
    <template v-else-if="media.type === 'other'">
      {{ this.slugMediaName }}
    </template>
  </div>
</template>
<script>
import _ from 'underscore';

// is loaded by Media and by EditMedia

export default {
  props: {
    slugMediaName: String,
    slugProjectName: String,
    media: Object,
    context: {
      type: String,
      default: 'preview'
      // preview, edit, ou autre (hi-res, pas de input text)
    },
    value: {
      type: String,
      default: ''
    },
    is_hovered: Boolean,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      available_resolutions: {
        preview: 360,
        preview_hovered: 600,
        default: 1600
      },
      mediaURL: `/${this.slugProjectName}/${this.slugMediaName}`
    };
  },
  mounted() {
    if (this.context === 'edit') {
      if (Modernizr !== undefined && !Modernizr.touchevents) {
        if (this.$refs.textField !== undefined) {
          this.$refs.textField.focus();
        }
      }
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
      // if image is gif and context is not 'preview', let’s show the original gif
      if (
        this.context !== 'preview' &&
        this.mediaURL.toLowerCase().endsWith('.gif')
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
      if (this.media.thumbs.length === 0) {
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
<style scoped lang="sass">
</style>
