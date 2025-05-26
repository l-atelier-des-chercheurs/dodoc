<template>
  <div
    class="_slashHomeInfos"
    :class="{
      'is--mobileView': $root.is_mobile_view,
    }"
  >
    <figure>
      <a :href="$root.publicPath + 'slash-timeline.png'" target="_blank">
        <img
          class=""
          :src="$root.publicPath + 'slash-timeline.png'"
          width="100%"
        />
        <figcaption>open in a new tab</figcaption>
      </a>
    </figure>
    <!-- <p class="_text">
      Useful links: 
      <ul>
        <li>  
          <a href="https://slash.dodoc.fr/+references/how-to-use/publications/basic-documentation?view_mode=html&chapter=infos-1747992685970.meta.txt" target="_blank">
            how to use this platform
          </a>
        </li>
        <li></li>
      </ul>
    </p> -->
  </div>
</template>
<script>
export default {
  props: {},
  components: {},
  data() {
    return {};
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped>
._slashHomeInfos {
  width: 100%;
  max-width: min(var(--max-column-width), var(--max-column-width-px));
  margin: 0 auto;
  padding: calc(var(--spacing) * 1.5);

  img {
    // float: right;
    // width: min(680px, 70vw);
    object-fit: scale-down;
  }

  &.is--mobileView {
    img {
      float: none;
      width: 100%;
    }
  }

  &::after {
    content: "";
    display: block;
    clear: both;
  }
}

._text {
  // max-width: 60ch;
  // margin: 2rem auto;
}

figcaption {
  font-size: var(--sl-font-size-x-small);
  text-align: center;
  // color: var(--active-color);
}
</style>
