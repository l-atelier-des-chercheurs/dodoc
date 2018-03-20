<template>
  <div id="app">

    <SystemBar
      v-if="$root.settings.enable_system_bar"
    >
    </SystemBar>

    <div class="container">
      <div class="row">
        <ListView>

        </ListView>

      </div>
    </div>

    <div class="container">
      <div class="row">
        <template>
          <BottomFooter v-if="current_slugFolderName === ''">
          </BottomFooter>
        </template>
      </div>
    </div>

    <portal-target name="modal_container" />

  </div>
</template>

<script>
import SystemBar from './SystemBar.vue';
import ListView from './ListView.vue';
import BottomFooter from './components/BottomFooter.vue';

export default {
  name: 'app',
  components: {
    SystemBar,
    ListView,
    BottomFooter
  },
  props: ['current_slugFolderName', 'currentFolder'],
  data() {
    return {};
  },
  computed: {
  },
  watch: {},
  methods: {}
};
</script>

<style></style>
