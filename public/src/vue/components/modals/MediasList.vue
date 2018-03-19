<template>
  <Modal
    @close="$emit('close')"
    >
    <template slot="header">
      <span class="text-cap"> Flux</span>
    </template>

    <template slot="preview">
      <Tableau
        :display="'mediasList'"
        :filter="filter"
        :sort="sort"
        :sortedMedias="sortedMedias"
        :timelineInfos="timelineInfos"
        :slugFolderName="slugFolderName"
        @setSort="$emit('setSort')"
        @setFilter="$emit('setFilter')"
        >
      </Tableau>
    </template>
  </Modal>
</template>
<script>
import Modal from './BaseModal.vue';
import Tableau from '../sidebar/Tableau.vue';

export default {
  props: {
    filter: String,
    sort: Object,
    sortedMedias: Array,
    timelineInfos: Object,
    slugFolderName: String
  },
  components: {
    Modal,
    Tableau
  }
};
</script>