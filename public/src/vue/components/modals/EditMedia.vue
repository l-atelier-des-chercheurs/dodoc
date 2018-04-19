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

      <div v-if="!read_only" class="m_modal--buttonrow flex-wrap flex-vertically-start flex-space-between flex-same-basis">
        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click="removeMedia()"
          :disabled="read_only"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <path d="M16.79,35.19l-.72-16.86H33l-.72,16.86a1.42,1.42,0,0,1-1.46,1.31H18.25A1.42,1.42,0,0,1,16.79,35.19Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <path d="M20.83,15.41v-2a.89.89,0,0,1,.92-.86h5.52a.89.89,0,0,1,.92.86v2Z" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="20.75" y1="34.18" x2="20.75" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.66" y1="34.18" x2="24.66" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="28.58" y1="34.18" x2="28.58" y2="21.01" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14" y1="15.41" x2="35" y2="15.41" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>

          <span class="text-cap font-verysmall">
            {{ $t('remove') }}
          </span>
        </button>

        <button type="button"
          class="bg-transparent button-round margin-verysmall padding-verysmall"
          @click.prevent="printMedia()"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <rect x="12.5" y="18.57" width="24" height="12.78" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="16.83 18.57 16.83 15.54 20.38 12.03 32.17 12.03 32.17 18.57" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <rect x="16.83" y="25.95" width="15.33" height="10.08" style="fill: #4d4d4d;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="29.29" x2="29.53" y2="29.29" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="19.12" y1="32.17" x2="29.53" y2="32.17" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="14.11" y1="25.95" x2="34.86" y2="25.95" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <ellipse cx="32.37" cy="22.15" rx="0.75" ry="0.74" style="fill: #fff;stroke: #fff;stroke-miterlimit: 10"/>
                    <polyline points="20.02 11.99 20.02 15.49 16.52 15.49" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            {{ $t('print') }}
          </span>
        </button>

        <a :download="slugMediaName" :href="mediaURL" :title="slugMediaName" target="_blank"
          class="button bg-transparent button-round margin-verysmall padding-verysmall"
          :disabled="read_only"
          >
          <svg xmlns="http://www.w3.org/2000/svg" width="49" height="49" viewBox="0 0 49 49">
            <g id="Calque_2" data-name="Calque 2">
              <g id="Editeur_txt" data-name="Editeur txt">
                <g>
                  <g>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: #4d4d4d"/>
                    <circle cx="24.5" cy="24.5" r="24" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <g>
                    <polyline points="33.12 20.63 24.5 28.82 15.88 20.63" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                    <line x1="24.5" y1="28.82" x2="24.5" y2="12.53" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                  </g>
                  <line x1="13.26" y1="34.05" x2="35.74" y2="34.05" style="fill: none;stroke: #fff;stroke-miterlimit: 10"/>
                </g>
              </g>
            </g>
          </svg>
          <span class="text-cap font-verysmall">
            {{ $t('download') }}
          </span>
        </a>
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
    openMediaNewWindow: function() {},
    removeMedia: function() {
      if (window.confirm(this.$t('sureToRemoveMedia'))) {
        this.$root.removeMedia(this.slugFolderName, this.slugMediaName);
        // then close that popover
        this.$emit('close', '');
      }
    },
    editThisMedia: function(event) {
      console.log('editThisMedia');
      this.$root.editMedia({ 
        slugProjectName: this.slugProjectName, 
        slugMediaName: this.slugMediaName,
        content: this.mediadata 
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
