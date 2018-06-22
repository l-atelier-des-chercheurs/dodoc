<template>
  <div class="m_mediafilterindicator">
    <div class="flex-nowrap flex-horizontally-start flex-vertically-centered flex-no-grow">
      <button
        class="button-round bg-transparent padding-sides-small is--small"
        @click="$root.unsetMediaFilter()"
      >
        <img src="/images/i_close_sansfond.svg">
      </button>

      <div class="padding-vert-verysmall text-ellipsis">
        <div class="text-ellipsis font-small c-noir">
          {{ $t('media_filter') }}
        </div>
        <div 
          v-for="(name, key) in media_filter" 
          :key="key"
          class="text-ellipsis"
        >
          {{ $t(key) }} = {{ name }}
        </div>
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