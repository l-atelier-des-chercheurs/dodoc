<template>
  <div>
    <SingleBaseMediaPicker
      :field_name="'base_media_filename'"
      :content="make.base_media_filename"
      :path="make.$path"
      :media_type_to_pick="media_type_to_pick"
    />
    <SingleBaseMediaPicker
      :field_name="'base_media_filename'"
      :content="make.base_media_filename"
      :path="make.$path"
      :media_type_to_pick="media_type_to_pick"
    />
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
