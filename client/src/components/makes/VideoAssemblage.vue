<template>
  <div class="_videoAssemblage">
    <!-- <StoryTemplate :publication="remix" :can_edit="true" /> -->
  </div>
</template>
<script>
// import StoryTemplate from "@/components/publications/templates/StoryTemplate.vue";

export default {
  props: {
    remix: Object,
  },
  components: {
    // StoryTemplate,
  },
  data() {
    return {
      show_media_picker: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._videoAssemblage {
  padding: calc(var(--spacing) * 1);
}
</style>
