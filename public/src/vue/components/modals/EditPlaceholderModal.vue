<template>
  <Modal
    @close="$emit('close')"
    :read_only="read_only"
    :typeOfModal="'MediumAndScroll'"
  >
    <template slot="header">
      <span class>{{ $t("placeholder") }}</span>
    </template>

    <template slot="preview">
      <div class="m_mediaStory padding-small" :class="`type-${media.type}`">
        <div class="" :class="`type-${media.type}`">
          <div class="_placeholder">
            <!-- <label>{{ $t("placeholder") }} </label> -->
            <div class="_placeholder--instructions">
              <label>{{ $t("instructions") }}</label>
              <MediaField
                :value="media.instructions"
                :show_edit_button="true"
                :add_instructions="$t('add_instructions')"
                :edit_instructions="$t('edit_instructions')"
                :read_only="read_only"
                @updateField="
                  (value) =>
                    $emit('updateMediaPubliMeta', { instructions: value })
                "
              />
            </div>
            <div class="_placeholder--constraints">
              <label v-html="$t('type_of_expected_contents:')" />
              <PlaceholderConstraints
                :available_modes="media.available_modes"
                :read_only="preview_mode || read_only"
                :paged_mode="true"
                @updateField="
                  (value) =>
                    $emit('updateMediaPubliMeta', { available_modes: value })
                "
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template slot="submit_button">{{ $t("create") }}</template>
  </Modal>
</template>
<script>
import Modal from "./BaseModal.vue";
import PlaceholderConstraints from "../subcomponents/PlaceholderConstraints.vue";
import MediaField from "../subcomponents/MediaField.vue";

export default {
  props: {
    read_only: Boolean,
    media: Object,
  },
  components: {
    Modal,
    MediaField,
    PlaceholderConstraints,
  },
  data() {
    return {};
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
