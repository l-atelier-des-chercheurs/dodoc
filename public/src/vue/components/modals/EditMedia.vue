<template>
  <Modal
    :backgroundColor="mediadata.color"
    @close="$emit('close')"
    @submit="editThisMedia"
    :read_only="read_only"
    :typeOfModal="'LargeAndNoScroll'"
    >
    <template slot="header">
      <div class="">{{ $t('edit_the_media') }}</div>
    </template>

    <template slot="sidebar">

      <div class="m_metaField" v-if="!!media.type">
        <div>
          {{ $t('type') }}
        </div>
        <div>
          {{ media.type }}
          <!-- <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" /> -->
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
          {{ formatDateToHuman(media.date_created) }}
        </div>
      </div>
      <div class="m_metaField">
        <div>
          {{ $t('edited') }}
        </div>
        <div>
          {{ formatDateToHuman(media.date_modified) }}
        </div>
      </div>

<!-- Caption -->
      <div 
      v-if="(!read_only || !!mediadata.caption) && mediadata.type !== 'marker' && mediadata.type !== 'text'"
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
      <div v-if="!read_only || !!mediadata.authors" class="margin-bottom-small">
        <label>{{ $t('author') }}</label>
        <textarea v-model="mediadata.authors" :readonly="read_only">
        </textarea>
      </div>

<!-- Fav or not -->
      <div class="margin-bottom-small">
        <span class="switch">
          <input type="checkbox" class="switch" id="favswitch" v-model="mediadata.fav" :readonly="read_only">
          <label for="favswitch">{{ $t('fav') }}</label>
        </span>
      </div>

      <div v-if="!read_only" class="m_modal--buttonrow">
        <hr>
        <button type="button"
          class="buttonLink"
          @click.prevent="printMedia()"
          >
          {{ $t('print') }}
        </button>

        <a 
          :download="slugMediaName" 
          :href="mediaURL" 
          :title="slugMediaName" 
          target="_blank"
          class="buttonLink"
          :disabled="read_only"
          >
          {{ $t('download') }}
        </a>
        
        <button type="button"
          class="buttonLink"
          @click="removeMedia()"
          :disabled="read_only"
          >
          {{ $t('remove') }}
        </button>
      </div>

    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

    <template slot="preview">
      <MediaContent
        :context="'edit'"
        :slugMediaName="slugMediaName"
        :slugProjectName="slugProjectName"
        :media="media"
        :read_only="read_only"
        v-model="mediadata.content"
      >
      </MediaContent>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import MediaContent from '../subcomponents/MediaContent.vue';
import DateTime from '../subcomponents/DateTime.vue';

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
    Modal,
    DateTime,
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
      mediaURL: `/${this.slugProjectName}/${this.slugMediaName}`
    };
  },
  computed: {
    date_uploaded_human() {
      return this.$moment(this.media.date_upload).format('l LTS');
    }
  },
  methods: {
    printMedia: function() {
      window.print();
    },
    formatDateToHuman(date) {
      return this.$moment(date, 'YYYY-MM-DD HH:mm:ss').format('LLL');
    },
    removeMedia: function() {
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia({
          slugFolderName: this.slugProjectName, 
          slugMediaName: this.slugMediaName
        });
        // then close that popover
        this.$emit('close', '');
      }
    },
    editThisMedia: function(event) {
      console.log('editThisMedia');
      this.$root.editMedia({ 
        slugFolderName: this.slugProjectName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata
      });

      // then close that popover
      this.$emit('close', '');
    }
  },
  mounted() {}
};
</script>
<style>

</style>
