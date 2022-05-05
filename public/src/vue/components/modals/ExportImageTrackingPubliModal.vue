<template>
  <Modal
    @close="$emit('close')"
    class="m_exportModal"
    :typeOfModal="'EditMeta'"
  >
    <template slot="header">
      <span class>{{ $t("export_creation") }}</span>
    </template>

    <template slot="sidebar">
      <div class="margin-sides-medium font-small">
        <template v-if="!current_mind">
          <ImageTrackingMakeTarget
            :medias="all_targets"
            :slugPubliName="slugPubliName"
          />
        </template>
        <div v-else-if="!current_mind">{{ $t("missing_mind_file") }}</div>
        <div v-else-if="current_mind">{{ $t("has_mind_file") }}</div>

        <div class>
          <!-- <p>{{ $t("export_stopmotion_instructions") }}</p> -->
          <!-- <hr /> -->

          <div class="margin-bottom-small">
            <QRCodeToResource
              :type="'publications'"
              :slugFolderName="slugPubliName"
            />
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>
<script>
import ImageTrackingMakeTarget from "../publication_templates/subcomponents/ImageTrackingMakeTarget.vue";
import QRCodeToResource from "./qr/QRCodeToResource.vue";
import { setTimeout } from "timers";

export default {
  props: {
    publication: Object,
    slugPubliName: String,
    all_targets: Array,
    current_mind: Object,
  },
  components: {
    ImageTrackingMakeTarget,
    QRCodeToResource,
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
