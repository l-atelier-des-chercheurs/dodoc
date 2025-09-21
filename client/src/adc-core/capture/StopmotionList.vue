<template>
  <BaseModal2 :title="$t('stopmotion_list')" @close="$emit('close')">
    <transition name="fade_fast" :duration="150" mode="out-in">
      <LoaderSpinner v-if="is_loading" />
      <div class="m_stopmotionList" v-else>
        <div class="u-instructions" v-if="sorted_stopmotions.length === 0">
          {{ $t("no_stopmotion_created_yet") }}
        </div>
        <div v-else>
          <transition-group tag="div" name="listComplete">
            <div
              v-for="stopmotion in sorted_stopmotions"
              class=""
              :key="stopmotion.$path"
            >
              <StopmotionPreview
                :stopmotion_path="stopmotion.$path"
                @load="$emit('loadStopmotion', stopmotion.$path)"
                @remove="removeStopmotion(stopmotion.$path)"
              />
            </div>
          </transition-group>
        </div>
      </div>
    </transition>
  </BaseModal2>
</template>
<script>
import StopmotionPreview from "./StopmotionPreview.vue";

export default {
  props: {
    project_path: String,
  },
  components: {
    StopmotionPreview,
  },
  data() {
    return {
      path: `${this.project_path}/stopmotions`,
      is_loading: true,
      stopmotions: [],
    };
  },
  created() {},
  async mounted() {
    this.is_loading = true;
    this.stopmotions = await this.$api.getFolders({
      path: this.path,
    });
    this.is_loading = false;
    this.$api.join({ room: this.path });
  },
  beforeDestroy() {
    this.$api.leave({ room: this.path });
  },
  watch: {},
  computed: {
    sorted_stopmotions() {
      const _stopmotions = this.stopmotions.slice();
      return _stopmotions.sort(
        (a, b) => +new Date(b.$date_created) - +new Date(a.$date_created)
      );
    },
  },
  methods: {
    async removeStopmotion(path) {
      // this.fetch_status = "pending";
      // this.fetch_error = null;

      try {
        await this.$api.deleteItem({
          path,
        });
        // this.response = response.data;
        // this.fetch_status = "success";
        // this.$router.push("/projects");
      } catch (e) {
        // this.fetch_status = "error";
        // this.fetch_error = e.response.data;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
.m_stopmotionList {
  position: relative;
  padding-top: calc(var(--spacing) / 2);
}
</style>
