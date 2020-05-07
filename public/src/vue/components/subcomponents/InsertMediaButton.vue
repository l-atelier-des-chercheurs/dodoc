<template>
  <div class="m_insertMediaButton" :class="{ 'is--open': show_menu }">
    <button
      type="button"
      class="m_insertMediaButton--toggleButton"
      @click="show_menu = !show_menu"
      :content="$t('insert_medias_here')"
      v-tippy="{
        placement: 'bottom',
        delay: [600, 0],
      }"
    ></button>

    <transition name="scaleIn" :duration="150">
      <div class="m_insertMediaButton--menu" v-if="show_menu">
        <button type="button" class="button-thin bg-orange" @click="createText">
          capture
        </button>
        <button type="button" class="button-thin bg-rouge" @click="createText">
          importer
        </button>
        <button
          type="button"
          class="button-thin bg-bleumarine"
          @click="createText"
        >
          Texte
        </button>
      </div>
    </transition>
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {
      show_menu: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {
    createText() {
      this.$emit("addMedia", {
        type: "text",
      });

      this.show_menu = false;
    },
  },
};
</script>
<style lang="scss" scoped></style>
