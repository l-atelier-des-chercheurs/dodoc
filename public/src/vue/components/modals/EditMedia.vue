<template>
  <Modal
    :backgroundColor="mediadata.color"
    @close="$emit('close')"
    @submit="editThisMedia"
    :read_only="read_only"
    :typeOfModal="media.type !== 'text' ? 'LargeAndNoScroll' : 'LargeAndNoScroll'"
    :askBeforeClosingModal="askBeforeClosingModal"
    :show_sidebar="$root.media_modal.show_sidebar"
    :is_minimized="$root.media_modal.minimized"
    :can_minimize="true"
    :media_navigation="true"
    >
    <template slot="header">
      <div class="">{{ $t('edit_the_media') }}</div>
    </template>

    <template slot="sidebar">
      <!-- <small>{{ this.$root.allAuthors }}</small> -->

      <div v-if="!read_only" class="m_modal--buttonrow">
        <!-- CONFLICT WITH QR PRINTING -->
        <!-- <button type="button"
          class="buttonLink"
          @click.prevent="printMedia()"
          >
          {{ $t('print') }}
        </button> -->

        <a 
          :download="media.media_filename" 
          :href="mediaURL" 
          :title="media.media_filename" 
          target="_blank"
          class="buttonLink hide_on_print"
          :disabled="read_only"
          >
          {{ $t('download') }}
        </a>
        
        <button type="button"
          class="buttonLink hide_on_print"
          @click.prevent="removeMedia()"
          :disabled="read_only"
          >
          <svg version="1.1" class="inline-svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="91.6px"
            height="95px" viewBox="0 0 91.6 95" style="enable-background:new 0 0 91.6 95;" xml:space="preserve">
            <path class="st0" d="M91.6,17H62.9V0H28.7v17H0v9.4h11.3V95h69V26.4h11.3V17z M64.4,69.4L57.8,76l-12-12l-12,12l-6.6-6.6l12-12
            l-12-12l6.6-6.6l12,12l12-12l6.6,6.6l-12,12L64.4,69.4z M38.1,9.4h15.3V17H38.1V9.4z"/>
          </svg>
          {{ $t('remove') }}
        </button>

        <template v-if="showQRModal">
          <hr>
          <CreateQRCode
            :slugProjectName="slugProjectName"
            :media="media"
          />
        </template>

        <button type="button" class="buttonLink c-noir" @click="showQRModal = !showQRModal">
          <svg version="1.1" class="inline-svg"
            xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
            x="0px" y="0px" width="20px" height="20px" viewBox="0 0 90 90" style="enable-background:new 0 0 90 90;" xml:space="preserve">
            <path d="M48,0v42h42V0H48z M84,36H54V6h30V36z M13,77h16V61H13V77z M0,90h42V48H0V90z M6,54h30v30H6V54z M63,48H48v13h15V48z M69,54
              h8v7h-8v12h-8v-8h-9v8h5v9h-9v8h21v-8h13v-9h-5v-8h13V48H69V54z M0,42h42V0H0V42z M6,6h30v30H6V6z M90,90v-8h-8v8H90z M13,29h16V13
              H13V29z M77,13H61v16h16V13z"/>
          </svg>
          <span class>
            {{ $t('share') }}
          </span>
        </button>

        <hr class="hide_on_print">
      </div>

      <div class="hide_on_print">

  <!-- Fav or not -->
        <div class="margin-bottom-small">
          <span class="switch switch-xs">
            <input type="checkbox" class="switch" id="favswitch_editmedia" v-model="mediadata.fav" :readonly="read_only">
            <label for="favswitch_editmedia"
              :class="{ 'c-rouge' : mediadata.fav }"
            >
              {{ $t('fav') }}
              <svg version="1.1"
                class="inline-svg"
                xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
                x="0px" y="0px" width="78.5px" height="106.4px" viewBox="0 0 78.5 106.4" style="enable-background:new 0 0 78.5 106.4;"
                xml:space="preserve">
                <polygon class="st0" points="60.4,29.7 78.5,7.3 78.5,7.3 12.7,7.3 12.7,52 78.5,52 78.5,52 	"/>
                <polygon class="st0" points="9.6,106.4 0,106.4 0,2 9.6,0 "/>
              </svg>
            </label>
          </span>
        </div>

        <div class="m_metaField" v-if="!!media.type">
          <div>
            {{ $t('type') }}
          </div>
          <div>
            {{ $t(media.type) }}
            <!-- <img class="mediaTypeIcon" :src="mediaTypeIcon[media.type]" /> -->
          </div>
        </div>
        <!-- <div class="m_metaField" v-if="!!media.authors">
          <div>
            {{ $t('author') }}
          </div>
          <div>
            {{ media.authors }}
          </div>
        </div> -->

        <div class="m_metaField">
          <div>
            {{ $t('created') }}
          </div>
          <div :title="media.date_created">
            {{ $root.formatDateToHuman(media.date_created) }}
          </div>
        </div>
        <div 
          class="m_metaField"
          v-if="media.hasOwnProperty('date_uploaded')"
        >
          <div>
            {{ $t('uploaded') }}
          </div>
          <div :title="media.date_uploaded">
            {{ $root.formatDateToHuman(media.date_uploaded) }}
          </div>
        </div>
        <div class="m_metaField">
          <div>
            {{ $t('edited') }}
          </div>
          <div :title="media.date_modified">
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
        <!-- <div v-if="!read_only || !!mediadata.keywords" class="margin-bottom-small">
          <label>{{ $t('keywords') }}</label>
          <textarea v-model="mediadata.keywords" :readonly="read_only">
          </textarea>
        </div> -->

  <!-- Keywords -->
      <div class="margin-bottom-small">
        <label>{{ $t('keywords') }}</label>
        <TagsInput 
          :keywords="mediadata.keywords"
          @tagsChanged="newTags => mediadata.keywords = newTags"
        />
      </div>

  <!-- Author(s) -->
        <div v-if="!read_only || !!mediadata.authors" class="margin-bottom-small">
          <label>{{ $t('author') }}</label>

          <AuthorsInput
            :currentAuthors="mediadata.authors"
            @authorsChanged="newAuthors => mediadata.authors = newAuthors"
          />

          <small>{{ $t('author_instructions') }}</small>
          <!-- <textarea v-model="mediadata.authors[0]" :readonly="read_only">
          </textarea> -->
        </div>

      </div>
    </template>

    <template slot="submit_button">
      {{ $t('save') }}
    </template>

    <template slot="preview">
      <MediaContent
        :context="'edit'"
        :slugFolderName="slugProjectName"
        :media="media"
        :read_only="read_only"
        v-model="mediadata.content"
      >
      </MediaContent>
      <div class="m_mediaOptions" v-if="false && media.type === 'image'">
        <label>Options</label>
        <div>
          <button type="button" class="buttonLink" @click="editRawMedia('rotate_image', {angle: 90})">
            Pivoter vers la droite
          </button>
          <button type="button" class="buttonLink" @click="editRawMedia('reset')">
            Revenir à l’original
          </button>
        </div>
      </div>
    </template>

  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import MediaContent from '../subcomponents/MediaContent.vue';
import DateTime from '../subcomponents/DateTime.vue';
import CreateQRCode from './qr/CreateQRCode.vue';
import { setTimeout } from 'timers';
import AuthorsInput from '../subcomponents/AuthorsInput.vue';
import TagsInput from '../subcomponents/TagsInput.vue';

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
    MediaContent,
    CreateQRCode,
    TagsInput,
    AuthorsInput
  },
  data() {
    return {
      showQRModal: false,
      is_minimized: false,

      mediadata: {
        type: this.media.type,
        authors: this.media.authors,
        caption: this.media.caption,
        keywords: this.media.keywords,
        fav: this.media.fav,
        content: this.media.content,
      },
      mediaURL: `/${this.slugProjectName}/${this.media.media_filename}`,
      askBeforeClosingModal: false,

      is_ready: false
    };
  },
  watch: {
    'mediadata': {
      handler() {
        if(this.is_ready) {
          this.askBeforeClosingModal = true;
        }
      },
      deep: true
    }
  },  
  created() {
    if(typeof this.mediadata.authors === 'string') {
      if( this.mediadata.authors !== '') {
        this.mediadata.authors = this.mediadata.authors.split(',').map(a => {return { name: a }} )
      } else {
        this.mediadata.authors = [];
      }
    }
    this.$nextTick(() => {
      this.is_ready = true;
    });
  },
  computed: {
  },
  methods: {
    printMedia: function() {
      window.print();
    },
    removeMedia: function() {
      this.$alertify
        .okBtn(this.$t('yes'))
        .cancelBtn(this.$t('cancel'))        
        .confirm(this.$t('sureToRemoveMedia'), 
        () => {
          this.$root.removeMedia({
            type: 'projects',
            slugFolderName: this.slugProjectName, 
            slugMediaName: this.slugMediaName
          });
          // then close that popover
          this.$emit('close', '');
        },
        () => {
        });                    
    },
    editThisMedia: function() {
      console.log('editThisMedia');
      this.$root.editMedia({ 
        type: 'projects',
        slugFolderName: this.slugProjectName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata
      });
      // then close that popover
      this.$emit('close', '');
    },
    editRawMedia: function(type, detail) {
      console.log('editRawMedia');
      this.$root.editMedia({ 
        type: 'projects',
        slugFolderName: this.slugProjectName, 
        slugMediaName: this.slugMediaName,
        data: this.mediadata,
        recipe_with_data: {
          apply_to: this.media.media_filename,
          type,
          detail
        }
      });
      // then close that popover
      // this.$emit('close', '');
    }
  },
};
</script>
<style>
.m_mediaOptions {
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 100;
  background-color: white;
  margin: 25px;
  padding: 15px;
}

</style>