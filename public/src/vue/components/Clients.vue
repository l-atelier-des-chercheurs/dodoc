<template>
  <div class="m_clientsList" v-if="$root.unique_clients.length">
    <button
      type="button"
      class="m_clientsList--indicator"
      @click="showClientList = !showClientList"
      :content="$t('other_users_connected')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    >
      <span>{{ $root.unique_clients.length }}</span>
    </button>
    <div class="m_clientsList--list" v-if="showClientList">
      <button
        type="button"
        class="m_clientsList--list--close"
        @click="showClientList = false"
      >
        ×
      </button>

      <label>{{ $t("other_users") }}</label>
      <br />
      <span
        class="m_clientsList--list--client"
        :key="client.id"
        v-for="client in $root.unique_clients"
      >
        <template v-if="client.data.hasOwnProperty('author')">{{
          $root.getAuthor(client.data.author.slugFolderName).name
        }}</template>
        <template v-else>{{ $t("anonymous") }}</template>
      </span>
    </div>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      showClientList: false,
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
<style></style>
