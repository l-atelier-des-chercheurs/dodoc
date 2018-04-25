<template>
  <div class="m_project--library"
  >

    <!-- <MediaFilterBar
      :currentSort="mediaSort"
      :currentFilter="mediaFilter"
    >
    </MediaFilterBar> -->

    <div class="m_project--library--actionbar">
      <FileUpload
        v-if="((project.password === 'has_pass' && project.authorized) || project.password !== 'has_pass') && $root.state.connected"
        :slugProjectName="slugProjectName"
        :disabled="read_only"
      >
      </FileUpload>
      <button type="button" class="barButton barButton_text" @click="createTextMedia">
        <span>
          Créer du texte
        </span>
      </button>
    </div>

    <div class="sectionTitle_small margin-sides-medium">
      Tous les médias
    </div>
    <div class="m_project--library--medias">
      <MediaCard
        v-for="media in sortedMedias"
        :key="media.slugMediaName"
        :media="media"
        :slugMediaName="media.slugMediaName"
        :slugProjectName="slugProjectName"
      >
      </MediaCard>
    </div>
    
  </div>    
</template>
<script>
import MediaFilterBar from './MediaFilterBar.vue';
import FileUpload from './FileUpload.vue';
import MediaCard from './subcomponents/MediaCard.vue';

export default {
  props: {
    project: Object,
    slugProjectName: String,
    read_only: Boolean
  },
  components: {
    MediaFilterBar,
    FileUpload,
    MediaCard
  },
  data() {
    return {
      mediaFilter: {
        fav: false
      },
      mediaSort: {
        field: 'date_uploaded',
        type: 'date',
        order: 'descending'
      }
    }
  },
  
  created() {
  },
  watch: {
    'project.medias': function() {
      let justCreatedTextMedia = Object.keys(this.project.medias).filter((m) => {
        let data = this.project.medias[m];
        return data.hasOwnProperty('id') && data.id === this.$root.justCreatedTextmediaID;
      });      
      if(justCreatedTextMedia.length > 0) {
        this.openMediaModal(justCreatedTextMedia[0]);
        this.$root.justCreatedTextmediaID = false;
      }
    }

  },

  computed: {
    sortedMedias() {
      var sortable = [];
      for (let slugMediaName in this.project.medias) {
        let mediaDataToOrderBy;

        if (this.mediaSort.type === 'date') {
          mediaDataToOrderBy = +this.$moment(
            this.project.medias[slugMediaName][this.mediaSort.field],
            'YYYY-MM-DD HH:mm:ss'
          );
          if(!mediaDataToOrderBy) {
            mediaDataToOrderBy = 1000;
          }
        } else if (this.mediaSort.type === 'alph') {
          mediaDataToOrderBy = this.project.medias[slugMediaName][
            this.mediaSort.field
          ];
          if(!mediaDataToOrderBy) {
            mediaDataToOrderBy = 'z';
          }          
        }
        sortable.push({
          slugMediaName: slugMediaName,
          mediaDataToOrderBy: mediaDataToOrderBy
        });
      }


      let sortedSortable = sortable.sort(function(a, b) {
        let valA = a.mediaDataToOrderBy;
        let valB = b.mediaDataToOrderBy;
        if (
          typeof a.mediaDataToOrderBy === 'string' &&
          typeof b.mediaDataToOrderBy === 'string'
        ) {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) {
          return -1;
        }
        if (valA > valB) {
          return 1;
        }
        return 0;
      });

      if (this.mediaSort.order === 'descending') {
        sortedSortable.reverse();
      }

      // array order is garanteed while objects properties aren’t,
      // that’s why we use an array here
      let sortedMedias = sortedSortable.reduce((accumulator, d) => {
        let sortedMediaObj = this.project.medias[d.slugMediaName];
        sortedMediaObj.slugMediaName = d.slugMediaName;

        if (Object.keys(this.mediaFilter).length > 0) {
          // filter those that contain props
          // TODO for multiple filters

          if(sortedMediaObj.fav === this.mediaFilter.fav) {
            accumulator.push(sortedMediaObj);
          }

          // let originalContentFromMedia =
          //   sortedMediaObj[this.mediaSort.field] + '';
          // if (originalContentFromMedia.indexOf(this.mediaFilter) !== -1) {
          // }
        } else {
          accumulator.push(sortedMediaObj);
        }
        return accumulator;
      }, []);
      
      return sortedMedias;
    }    
  },
  methods: {
    openMediaModal(slugMediaName) {
      if (this.$root.state.dev_mode === 'debug') {
        console.log('METHODS • MediaLibrary: openMedia');
      }
      this.$root.showMediaModalFor({ slugProjectName: this.slugProjectName, slugMediaName: this.slugMediaName });      
    },
    createTextMedia() {
      const mediaMeta = {
        slugProjectName: this.slugProjectName,
        type: 'text',
        additionalMeta: ''
      };
      if(this.$root.settings.current_author !== false) {
        mediaMeta.additionalMeta.authors = this.$root.settings.current_author.name;
      }
      this.$root.createTextMedia(mediaMeta);      
    }
  }
}
</script>
<style>

</style>