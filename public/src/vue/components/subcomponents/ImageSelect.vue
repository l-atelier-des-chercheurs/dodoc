<template>
  <div>
    <div v-if="!image">
      <input type="file" @change="onFileChange">
    </div>
    <div v-else>
      <img :src="image" />
      <button type="button" @click.stop="removeImage">Remove image</button>
    </div>
  </div>
</template>
<script>

export default {
  props: {
  },
  components: {
  },
  data() {
    return {
      image: ''
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
    }
  }
}
</script>
<style scoped>
img {
  width: 200px;
}

</style>