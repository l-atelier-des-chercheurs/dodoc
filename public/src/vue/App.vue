<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :withTitleBar="true"
    >
    </SystemBar>

    <TopBar
      :has_back_button="view === 'FolderView'"
      :slugFolderName="current_slugFolderName"
    >
    </TopBar>

    <ListView
      :presentationMD="$root.store.presentationMD"
      :read_only="!$root.state.connected"
      :folders="$root.store.folders"
    >
    </ListView>

    <transition name="">
      <FolderView
        v-if="view === 'FolderView' && currentFolder.hasOwnProperty('name')"
        :slugFolderName="current_slugFolderName"
        :folder="currentFolder"
        :read_only="!$root.state.connected"
      >
      </FolderView>
    </transition>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import TopBar from './TopBar.vue';
import ListView from './ListView.vue';
import FolderView from './FolderView.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    TopBar,
    ListView,
    FolderView
  },
  props: {
    current_slugFolderName: String,
    currentFolder: Object
  },
  data() {
    return {
    };
  },
  computed: {
    view: function() {
      if (this.current_slugFolderName !== '') {
        return 'FolderView';
      }
      return 'ListView';
    }
  },
  watch: {},
  methods: {}
};
</script>

<style lang="less" src="style.less"></style>
