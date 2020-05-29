<template>
  <div id="app" :class="{ 'is--wide': $root.screen_is_wide }">
    <template v-if="$root.store.request.display === 'standalone'">
      <div class="m_standaloneMedia">
        <MediaContent
          class
          :context="'full'"
          :autoplay="true"
          :slugFolderName="$root.store.request.slugFolderName"
          :media="$root.requested_media"
          v-model="$root.requested_media.content"
        />
      </div>
    </template>
    <template
      v-else-if="
        [
          'export_publication',
          'print_publication',
          'link_publication',
        ].includes($root.state.mode) && $root.current_publication
      "
    >
      <Publication
        :publication="$root.current_publication"
        :read_only="!$root.state.connected"
      />
    </template>

    <template
      v-else-if="$root.state.mode === 'live' && !$root.state.authentificated"
    >
      <SessionPassword
        v-if="$root.showSessionPasswordModal"
        @close="$root.showSessionPasswordModal = false"
        :read_only="!$root.state.connected"
      />
    </template>
    <template
      v-else-if="
        $root.showAuthorsListModal ||
        ($root.state.local_options.force_login && !$root.current_author)
      "
    >
      <SimpleAuthorLogin
        v-if="
          $root.state.local_options.simple_login &&
          (!$root.current_author || $root.current_author.role === 'participant')
        "
        :prevent_close="
          $root.state.local_options.force_login && !$root.current_author
        "
        @close="$root.showAuthorsListModal = false"
      />
      <AuthorsList
        v-else
        :authors="$root.store.authors"
        :prevent_close="
          $root.state.local_options.force_login && !$root.current_author
        "
        @close="$root.showAuthorsListModal = false"
      />
    </template>
    <template
      v-else-if="
        $root.store.request.display === 'survey' ||
        ($root.current_author && $root.current_author.role === 'participant')
      "
    >
      <Survey />
    </template>
    <template
      v-if="
        $root.state.mode === 'live' &&
        $root.store.request.display !== 'standalone' &&
        $root.store.request.display !== 'survey' &&
        (!$root.current_author ||
          $root.current_author.role !== 'participant') &&
        !$root.state.local_options.force_login
      "
    >
      <FullDodoc />
    </template>

    <portal-target name="modal_container" />
  </div>
</template>

<script>
import FullDodoc from "./FullDodoc.vue";
import Survey from "./Survey.vue";

import SessionPassword from "./components/modals/SessionPassword.vue";
import AuthorsList from "./components/modals/AuthorsList.vue";
import MediaContent from "./components/subcomponents/MediaContent.vue";
import Publication from "./Publication.vue";

import SimpleAuthorLogin from "./components/modals/SimpleAuthorLogin.vue";

export default {
  name: "app",
  components: {
    FullDodoc,
    Survey,
    AuthorsList,
    SessionPassword,
    Publication,
    SimpleAuthorLogin,
    MediaContent,
  },
  props: {},
  data() {
    return {};
  },
  watch: {},
  created() {},
  beforeDestroy() {},
  computed: {},
  methods: {},
};
</script>

<style lang="less" src="style.less"></style>
