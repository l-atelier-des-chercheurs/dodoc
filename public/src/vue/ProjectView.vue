<template>
  <div class="m_projectview">
    <Project
      :slugProjectName="slugProjectName"
      :project="project"
      :read_only="read_only"
      :context="'full'"
    />
  </div>
</template>
<script>
import Project from './components/Project.vue';

export default {
  props: {
    slugProjectName: String,
    project: Object,
    read_only: Boolean
  },
  components: {
    Project
  },
  data() {
    return {
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
  }
}
</script>
<style>

</style>