<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
      :withTitleBar="true"
    >
    </SystemBar>

    <transition name="fade" duration="350">
      <ListView
        v-if="view === 'ListView'"
        :presentationMD="$root.store.presentationMD"
        :read_only="!$root.state.connected"
        :folders="$root.store.folders"
      >
      </ListView>
    </transition>

    <transition name="fade" duration="350">
      <FolderView
        v-if="view === 'FolderView' && currentFolder.hasOwnProperty('name')"
        :slugFolderName="current_slugFolderName"
        :folder="currentFolder"
        :read_only="!$root.state.connected"
      >
      </FolderView>
    </transition>

    <div class="container">
      <div class="row">
        <BottomFooter>
        </BottomFooter>
      </div>
    </div>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import ListView from './ListView.vue';
import FolderView from './FolderView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    ListView,
    FolderView,
    BottomFooter
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
