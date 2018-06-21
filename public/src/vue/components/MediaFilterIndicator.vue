<template>
  <div class="m_mediafilterindicator">
    <div class="flex-nowrap flex-vertically-centered">
      <button
        class="button-round bg-transparent padding-sides-verysmall is--small"
        @click="$root.unsetMediaFilter()"
      >
        <img src="/images/i_close_sansfond.svg">
      </button>

      <div class="padding-vert-verysmall">
        Filtre&nbsp;: 
        <span 
          v-for="(name, key) in media_filter" 
          :key="f"
        >
          {{ key }} = {{ name }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>


export default {
  props: {
    media_filter: Object
  },
  components: {
  },
  data() {
    return {
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style>

</style>