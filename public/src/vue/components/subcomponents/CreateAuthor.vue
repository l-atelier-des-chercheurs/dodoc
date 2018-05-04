<template>
  <div
    @close="$emit('close')"
    @submit="newAuthor"
    :read_only="read_only"
    >
    <!-- <span class="">{{ $t('create_an_author') }}</span> -->

<!-- Preview -->
    <div class="margin-bottom-small">
      <label>{{ $t('portrait') }}</label><br>
      <ImageSelect 
        @newPreview="value => { preview = value }"
        :instructions="'Sélectionnez une image de portrait'"  
      >
      </ImageSelect>
    </div>

<!-- Human name -->
    <div class="margin-bottom-small">
      <label>{{ $t('name') }}</label>
      <input type="text" v-model="authordata.name" required autofocus>
    </div>

<!-- Password -->
    <!-- <div class="margin-bottom-small">
      <label>{{ $t('password') }}</label>
      <input type="password" v-model="authordata.password">
      <small>{{ $t('password_instructions') }}</small>
    </div> -->

<!-- NFC tag(s) -->
    <div class="margin-bottom-small">
      <label>{{ $t('nfc_tag') }}</label><br>
      <input type="text" v-model="authordata.nfc_id">
    </div>

    <button type="button" @click="$emit('close')">
      {{ $t('cancel') }}
    </button>
    <button type="button" @click="newAuthor">
      {{ $t('create') }}
    </button>

  </div>
</template>
<script>
import ImageSelect from '../subcomponents/ImageSelect.vue';

export default {
  props: {
    read_only: Boolean
  },
  components: {
    ImageSelect
  },
  data() {
    return {
      authordata: {
        name: '',
        password: '',
        nfc_id: ''
      },
      preview: undefined
    };
  },
  computed: {},
  methods: {
    newAuthor: function(event) {
      console.log('newAuthor');

      function getAllAuthorNames() {
        let allAuthorsName = [];
        for (let slugAuthorName in window.store.authors) {
          let authorName = window.store.authors[slugAuthorName].name;
          allAuthorsName.push(authorName);
        }
        return allAuthorsName;
      }
      let allAuthorsName = getAllAuthorNames();

      // check if project name (not slug) already exists
      if (allAuthorsName.indexOf(this.authordata.name) >= 0) {
        // invalidate if it does
        this.$alertify
          .closeLogOnClick(true)
          .delay(4000)
          .error(this.$t('notifications.author_name_exists'));

        return false;
      }

      if(!!this.preview) {
        this.authordata.preview_rawdata = this.preview;
      }

      this.$root.createFolder({ type: 'authors', data: this.authordata });

      this.$emit('close', '');
    }
  }
};
</script>
<style>

</style>
