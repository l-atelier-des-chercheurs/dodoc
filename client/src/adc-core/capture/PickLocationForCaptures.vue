<template>
  <BaseModal2 :title="$t('location')" @close="$emit('close')">
    <div class="u-instructions u-spacingBottom">
      {{ $t("location_stored_in_localstorage") }}
    </div>
    <PositionPicker
      :field_name="'$location'"
      :content="location_to_add_to_medias"
      :can_edit="true"
      @newPosition="newPosition"
    />
  </BaseModal2>
</template>
<script>
export default {
  props: {
    location_to_add_to_medias: Object,
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    newPosition(new_location) {
      this.$emit("update:location_to_add_to_medias", new_location);
      setTimeout(() => {
        this.$emit("close");
      }, 1000);
    },
  },
};
</script>
<style lang="scss" scoped></style>
