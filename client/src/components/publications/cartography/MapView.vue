<template>
  <div class="_mapView">
    <DisplayOnMap
      class="_mapContainer"
      :pins="initial_view"
      :is_small="false"
    />
    <div class="_textContainer">
      <CollaborativeEditor2
        ref="textBloc"
        :path="''"
        :content="fake_content"
        :can_edit="false"
      />
    </div>
  </div>
</template>
<script>
import DisplayOnMap from "@/components/publications/cartography/DisplayOnMap.vue";

export default {
  props: {
    publication: Object,
  },
  components: {
    DisplayOnMap,
  },
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    initial_view() {
      const il = this.publication.map_initial_location;
      if (!il) return false;
      const longitude = il.split(" ")[0];
      const latitude = il.split(" ")[1];
      return [{ longitude, latitude }];
    },
    fake_content() {
      return `
        <h1>Salut !</h1>
        <p>Pellentesque vehicula consequat mi nec efficitur. Etiam nunc massa, 
          congue ut justo ac, cursus fringilla nisi. Aliquam erat volutpat. Integer 
          vulputate hendrerit sodales. Duis varius, purus sit amet varius dapibus, 
          velit est pellentesque lectus, quis auctor orci urna sed sapien. Curabitur 
          at risus quis magna lacinia ultricies. Vestibulum ante ipsum primis in 
          faucibus orci luctus et ultrices posuere cubilia curae; Fusce fringilla 
          nulla sit amet tempus maximus.
        </p>'
      `;
    },
  },
  methods: {},
};
</script>
<style lang="scss" scoped>
._mapView {
  width: 100%;
  height: 100vh;
  background: var(--c-gris);
  border-radius: 4px;
  overflow: hidden;

  display: flex;
  flex-flow: row nowrap;
}
._mapContainer {
  height: 100%;
}
._textContainer {
  min-height: 80vh;
  // margin: calc(var(--spacing) / 4);
  padding: calc(var(--spacing) / 1);
  background: var(--panel-color);
  border: var(--panel-borders);
  box-shadow: var(--panel-shadows);
  // border-radius: var(--panel-radius);
  text-align: left;
}
</style>
