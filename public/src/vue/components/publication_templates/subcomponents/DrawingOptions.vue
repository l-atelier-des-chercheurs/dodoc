<template>
  <div class="m_drawingOptions">
    <div class="m_drawingPad--drawingOptions">
      <div v-for="mode in ['select', 'drawing']" :key="mode">
        <input type="radio" :id="mode" :name="mode" :value="mode" v-model="drawing_options.mode" />
        <label :for="mode">
          <span>{{ mode }}</span>
        </label>
      </div>
      <!-- <label>
        <input type="color" v-model="drawing_options.color" />
        Couleur
      </label>
      <br />
      <label>
        <input type="color" v-model="drawing_options.background_color" />
        Couleur du fond
      </label>-->
    </div>
  </div>
</template>
<script>
export default {
  props: {
    drawing_options: Object
  },
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {
    drawing_options: {
      handler() {
        this.$emit("updateDrawingOptions", this.drawing_options);
      },
      deep: true
    }
  },
  computed: {},
  methods: {}
};
</script>
<style lang="scss"></style>
