<template>
  <div class="m_mediaview">
    <div class="m_mediaview--sidebar">
      <div>
        <h1 class="">{{ $t('edit_the_media') }}</h1>

        <div class="m_metaField" v-if="!!media.type">
          <div>
            {{ $t('type') }}
          </div>
          <div>
            {{ media.type }}
          </div>
        </div>
        <div class="m_metaField" v-if="!!media.authors">
          <div>
            {{ $t('author') }}
          </div>
          <div>
            {{ media.authors }}
          </div>
        </div>
        <div class="m_metaField">
          <div>
            {{ $t('created') }}
          </div>
          <div>
            {{ $root.formatDateToHuman(media.date_created) }}
          </div>
        </div>
        <div 
          class="m_metaField"
          v-if="media.hasOwnProperty('date_uploaded') && $root.formatDateToHuman(media.date_created) !== $root.formatDateToHuman(media.date_uploaded)"
        >
          <div>
            {{ $t('uploaded') }}
          </div>
          <div>
            {{ $root.formatDateToHuman(media.date_uploaded) }}
          </div>
        </div>
        <div class="m_metaField">
          <div>
            {{ $t('edited') }}
          </div>
          <div>
            {{ $root.formatDateToHuman(media.date_modified) }}
          </div>
        </div>

    <!-- Caption -->
        <div 
          v-if="(!read_only || !!mediadata.caption) && mediadata.type !== 'text'"
          class="margin-bottom-small" 
        >
          <label>{{ $t('caption') }}</label><br>
          <textarea v-model="mediadata.caption" :readonly="read_only">
          </textarea>
        </div>

    <!-- Type of media (if guessed wrong from filename, will only be stored in the meta file and used as a reference when displaying that media on the client) -->
    <!-- Disabled for now: if an image or video is tagged as "text" or marked, a folder becomes unreadable -->
        <!-- <div class="margin-bottom-small">
          <label>{{ $t('type') }}</label>
          <select v-if="!read_only" ref="type" v-model="mediadata.type">
            <option v-for="mediaType in $root.state.structure.media.type.options" :key="mediaType">
              {{ mediaType }}
            </option>
          </select>
          <input type="text" v-else :value="mediadata.type" readonly>
        </div> -->

    <!-- Keywords -->
        <div v-if="!read_only || !!mediadata.keywords" class="margin-bottom-small">
          <label>{{ $t('keywords') }}</label>
          <textarea v-model="mediadata.keywords" :readonly="read_only">
          </textarea>
        </div>

    <!-- Author(s) -->
        <!-- <div v-if="!read_only || !!mediadata.authors" class="margin-bottom-small">
          <label>{{ $t('author') }}</label>
          <textarea v-model="mediadata.authors" :readonly="read_only">
          </textarea>
        </div> -->

    <!-- Fav or not -->
        <div class="margin-bottom-small">
          <span class="switch switch-xs">
            <input type="checkbox" class="switch" id="favswitch" v-model="mediadata.fav" :readonly="read_only">
            <label for="favswitch">{{ $t('fav') }}</label>
          </span>
        </div>

        <div v-if="!read_only" class="m_mediaview--sidebar--buttonrow">
          <hr>
          <button type="button"
            class="buttonLink"
            @click.prevent="printMedia()"
            >
            {{ $t('print') }}
          </button>

          <a 
            :download="media.media_filename" 
            :href="mediaURL" 
            :title="media.media_filename" 
            target="_blank"
            class="buttonLink"
            :disabled="read_only"
            >
            {{ $t('download') }}
          </a>
          
          <button type="button"
            class="buttonLink"
            @click.prevent="removeMedia()"
            :disabled="read_only"
            >
            {{ $t('remove') }}
          </button>
        </div>

        <div 
          class="m_modal--save"
        >
          <button
            @click="editThisMedia"
            type="submit"
            :disabled="read_only"
            >
            <img src="/images/i_enregistre.svg"/>
            <span class="text-cap font-verysmall">
              <slot name="submit_button">
                {{ $t('save') }}
              </slot>
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="m_mediaview--preview">

      <MediaContent
        :context="'edit'"
        :slugFolderName="slugProjectName"
        :media="media"
        :read_only="read_only"
        v-model="mediadata.content"
      >
      </MediaContent>

    </div>
  </div>
</template>
<script>
import MediaContent from './components/subcomponents/MediaContent.vue';

export default {
  props: {
    slugProjectName: String,
    slugMediaName: String,
    media: Object,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    MediaContent
  },
  data() {
    return {
      mediadata: {
        type: this.media.type,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords: this.media.keywords,
        fav: this.media.fav,
        content: this.media.content
      },
      mediaURL: `/${this.slugProjectName}/${this.media.media_filename}`,
      askBeforeClosingModal: false
    };
  },
  watch: {
    'mediadata': {
      handler() {
        this.askBeforeClosingModal = true;
      },
      deep: true
    }
  },  
  mounted() {
  },
  computed: {
  },
  methods: {
    printMedia: function() {
      window.print();
    },
    removeMedia: function() {
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia({
          type: 'projects',
          slugFolderName: this.slugProjectName, 
          slugMediaName: this.slugMediaName
        });
        // then close that popover
        this.$root.closeMedia();
      }
    },
    editThisMedia: function(event) {
      console.log('editThisMedia');
      this.$root.editMedia({ 
        type: 'projects',
        slugFolderName: this.slugProjectName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata
      });
      // then close that popover
      this.$root.closeMedia();
    }
  },
};
</script>
<style>

</style>
