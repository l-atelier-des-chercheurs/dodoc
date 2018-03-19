<template>
  <div>
    <div class="m_addMedia">
      <button
        type="button"
        class="button button-round button-round-small margin-bottom-small bg-noir c-blanc button_addText"
        @click="addText"
        :disabled="read_only"
      >
        T
      </button>
      <button
        type="button"
        class="button button-round button-round-small margin-bottom-small bg-noir c-blanc button_addMarker"
        @click="addMarker"
        :disabled="read_only"
      >
        •
      </button>

<!--
      <FileInput
        v-model="file"
        :type="image"
        :read_only="read_only"
      >
      </FileInput>

      <input name="imageCapture" class="button margin-bottom-small button_addFile button_addImage" type="file" accept="image/*" capture @change="addImage">
      <input name="videoCapture" class="button margin-bottom-small button_addFile button_addVideo" type="file" accept="video/*" capture @change="addVideo">
      <input name="audioCapture" class="button margin-bottom-small button_addFile button_addAudio" type="file" accept="audio/*" capture @change="addAudio">
-->

      <FileUpload
        :slugFolderName="slugFolderName"
        :disabled="read_only"
      >
      </FileUpload>
    </div>

  </div>
</template>
<script>
import FileUpload from './FileUpload.vue';
import FileInput from './subcomponents/FileInput.vue';

export default {
  props: {
    slugFolderName: String,
    read_only: {
      type: Boolean,
      default: true
    }
  },
  components: {
    FileUpload,
    FileInput
  },
  data() {
    return {
      file: null
    };
  },
  mounted: function() {
    document.addEventListener('keyup', this.boitierPressed);
  },
  destroyed: function() {
    document.removeEventListener('keyup', this.boitierPressed);
  },
  watch: {
    file: function() {}
  },
  methods: {
    addText() {
      this.$root.createTextMedia({
        slugFolderName: this.slugFolderName,
        type: 'text'
      });

      this.$eventHub.$emit('timeline.scrollToToday');
    },
    addMarker() {
      this.$root.createTextMedia({
        slugFolderName: this.slugFolderName,
        type: 'marker',
        color: 'red',
        collapsed: true
      });
      this.$eventHub.$emit('timeline.scrollToToday');
    },
    boitierPressed(event) {
      console.log('METHODS • AddMediaButton: boitierPressed');

      // if there is a modal opened, let’s not do something
      if (this.$root.settings.has_modal_opened === true) {
        return;
      }

      if (event.target.tagName.toLowerCase() === 'input') {
        return;
      }

      var key = event.key;
      if (key === 'y' || key === 'w' || key === 'z') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'blue'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      } else if (key === 'u' || key == 's') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'red'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      } else if (key === 'i' || key === 'a' || key === 'q') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'green'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      } else if (key === 'o') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'yellow'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      } else if (key === 'p') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'orange'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      } else if (key === '6') {
        this.$root.createTextMedia({
          slugFolderName: this.slugFolderName,
          type: 'marker',
          color: 'purple'
        });
        this.$eventHub.$emit('timeline.scrollToToday');
      }
    }
  }
};
</script>
<style>

</style>