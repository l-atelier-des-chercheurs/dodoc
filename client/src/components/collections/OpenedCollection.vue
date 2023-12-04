<template>
  <div class="_openedCollection">
    <div class="">
      <button type="button" class="u-buttonLink" @click="$emit('close')">
        <b-icon icon="arrow-left" />
        {{ $t("back") }}
      </button>
      <RemoveMenu :remove_text="$t('remove')" @remove="removeColl" />
    </div>
    <h2>{{ collection.title }}</h2>
    <transition-group tag="div" class="itemGrid" name="listComplete" appear>
      <SharedFolderItem
        class="_file"
        v-for="file in files"
        :key="file.$path"
        :file="file"
      />
    </transition-group>
  </div>
</template>
<script>
import SharedFolderItem from "@/components/SharedFolderItem.vue";

export default {
  props: {
    collection: Object,
    files: Array,
  },
  components: {
    SharedFolderItem,
  },
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
  methods: {
    async removeColl() {
      await this.$api.deleteItem({
        path: this.collection.$path,
      });
      this.$emit("close");
    },
  },
};
</script>
<style lang="scss" scoped>
._openedCollection {
  text-align: left;
}

._file {
  width: 100px;
}
</style>
