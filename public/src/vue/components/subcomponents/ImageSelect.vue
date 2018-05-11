<template>
  <div class="m_imageselect">
    <div class="m_imageselect--input" v-if="!image">
      <input type="file" accept="image" id="addImage" class="inputfile-2"  @change="onFileChange">
      <label for="addImage">
        <svg width="20" height="17" viewBox="0 0 20 17"><path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z"></path></svg>
        {{ _instructions }}
      </label>
    </div>
    <div class="m_imageselect--image" v-else>
      <img :src="image" />
      <button class="buttonLink" type="button" @click="removeImage">Supprimer</button>
    </div>
  </div>
</template>
<script>

export default {
  props: {
    previewURL: String,
    instructions: String
  },
  components: {
  },
  data() {
    return {
      image: this.previewURL
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
    _instructions() {
      return this.instructions !== undefined ? this.instructions : this.$t('select_cover_image');
    }
  },
  methods: {
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length)
        return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var image = new Image();
      var reader = new FileReader();
      var vm = this;

      reader.onload = (e) => {
        let result = e.target.result;
        vm.image = result;
        this.$emit('newPreview', result);
      };
      reader.readAsDataURL(file);
    },
    removeImage: function (e) {
      this.image = '';
      this.$emit('newPreview', '');
    }
  }
}
</script>
<style scoped>
img {
  width: 200px;
}

</style>