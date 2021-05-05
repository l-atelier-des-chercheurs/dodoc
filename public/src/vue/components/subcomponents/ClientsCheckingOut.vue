<template>
  <div class="m_clientsCheckingOut" v-if="clients_checking_out.length > 0">
    <label v-if="client_selected">{{ $t("other_users_connected") }}</label>
    <div class="m_clientsCheckingOut--clients">
      <div
        v-for="client in clients_checking_out"
        :key="client.id"
        class="m_clientsCheckingOut--clients--client"
        @click.stop="
          client_selected !== client.id
            ? (client_selected = client.id)
            : (client_selected = false)
        "
      >
        <img
          class="_pp"
          v-if="
            client.data.hasOwnProperty('author') &&
            urlToPortrait($root.getAuthor(client.data.author.slugFolderName))
          "
          :src="
            urlToPortrait($root.getAuthor(client.data.author.slugFolderName))
          "
        />
        <span v-else class="_no_pp"> </span>

        <span class="_name" v-if="client_selected === client.id">
          <template v-if="client.data.hasOwnProperty('author')">{{
            $root.getAuthor(client.data.author.slugFolderName).name
          }}</template>
          <template v-else>{{ $t("anonymous") }}</template>
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    type: String,
    slugFolderName: String,
    metaFileName: String,
  },
  components: {},
  data() {
    return {
      client_selected: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    clients_checking_out() {
      return this.$root.findClientsLookingAt({
        type: this.type,
        slugFolderName: this.slugFolderName,
        metaFileName: this.metaFileName,
      });
    },
  },
  methods: {
    urlToPortrait(author) {
      if (!author || !author.preview) return false;
      let pathToSmallestThumb = author.preview.find((m) => m.size === 50);
      if (pathToSmallestThumb && pathToSmallestThumb.path) {
        pathToSmallestThumb = pathToSmallestThumb.path;
        return pathToSmallestThumb;
      }
      return false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
