<template>
  <div class="_openedFormat">
    <transition name="slideup" mode="out-in">
      <div class="_spinner" v-if="is_loading" key="loader">
        <LoaderSpinner />
      </div>
      <div v-else key="opened_format">
        <div v-if="!format.$path">
          {{ $t("failed_loading_format") }}
        </div>
        <div v-else :key="format.$path">
          <div class="_topbar">
            <button type="button" class="u-buttonLink" @click="$emit('close')">
              <b-icon icon="arrow-left" />
              {{ $t("back") }}
            </button>
            <RemoveMenu :remove_text="$t('remove')" @remove="removeFormat" />
          </div>

          <div class="_cont">
            <h2>{{ format.title }}</h2>

            <div v-if="!format.$files || format.$files.length === 0">
              no files
            </div>

            <transition-group
              tag="div"
              class="itemGrid"
              name="listComplete"
              appear
            >
              <div v-for="file in format.$files" :key="file.$path">
                {{ file.$path }}
              </div>
              <!-- <SharedFolderItem
              class="_file"
              v-for="file in files"
              :key="file.$path"
              :file="file"
              @open="$emit('openFile', file.$path)"
            /> -->
            </transition-group>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {
    opened_format_slug: String,
  },
  components: {},
  data() {
    return {
      is_loading: true,
      format: undefined,
      path: "formats/" + this.opened_format_slug,
    };
  },
  i18n: {
    messages: {
      fr: {},
    },
  },
  async created() {
    this.format = await this.$api
      .getFolder({
        path: this.path,
      })
      .catch((err) => {
        this.fetch_stopmotion_error = err.response;
      });

    this.is_loading = false;
    this.$api.join({ room: this.format });

    this.$eventHub.$on("format.addStack", this.addToStack);
  },
  mounted() {},
  beforeDestroy() {
    this.$api.leave({ room: this.format });
    this.$eventHub.$off("format.addStack", this.addToStack);
  },
  watch: {},
  computed: {
    files() {
      //
      return [];
    },
  },
  methods: {
    addToStack() {
      //
    },
    async updateOpenedCollection() {
      //
    },
    async removeFormat() {
      await this.$api.deleteItem({
        path: this.format.$path,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._openedFormat {
  position: absolute;
  top: 0;
  left: 0;
  background: var(--c-gris_clair);
  height: 100%;
  width: 100%;
  // border-top: 2px solid var(--c-gris);
  padding: calc(var(--spacing) / 1);
}
._spinner {
  padding: calc(var(--spacing) * 2);
}

._topbar {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

._cont {
  margin: calc(var(--spacing) / 2) 0;
}
</style>
