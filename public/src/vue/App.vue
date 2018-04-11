<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :withTitleBar="true"
    >
    </SystemBar>

    <TopBar
      :has_back_button="$root.settings.view !== 'ListView'"
      :slugFolderName="current_slugFolderName"
    >
    </TopBar>

    <ListView
      v-if="$root.settings.view === 'ListView'"
      :presentationMD="$root.store.presentationMD"
      :read_only="!$root.state.connected"
      :folders="$root.store.folders"
    >
    </ListView>

    <FolderView
      v-if="$root.settings.view === 'FolderView' && currentFolder.hasOwnProperty('name')"
      :slugFolderName="current_slugFolderName"
      :folder="currentFolder"
      :read_only="!$root.state.connected"
    >
    </FolderView>

    <CaptureView
      v-if="$root.settings.view === 'CaptureView'"
      :slugFolderName="current_slugFolderName"
      :folder="currentFolder"
    >
    </CaptureView>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import TopBar from './TopBar.vue';
import ListView from './ListView.vue';
import FolderView from './FolderView.vue';
import CaptureView from './CaptureView.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    TopBar,
    ListView,
    FolderView,
    CaptureView
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
  },
  watch: {
  },
  methods: {}
};
</script>

<style lang="less" src="style.less"></style>
