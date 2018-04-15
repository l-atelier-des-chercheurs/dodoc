<template>
  <div class="m_filterBar">
    <div>
      <div class="m_filterBar--header">
        <svg version="1.1"
          xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:a="http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
          x="0px" y="0px" width="23.9px" height="24px" viewBox="0 0 23.9 24" style="enable-background:new 0 0 23.9 24;"
          xml:space="preserve">
          <path d="M2.8,16.3c3.2,3.2,8.3,3.4,12,1.1l6.5,6.5l2.7-2.7l-6.5-6.5c2.2-3.7,2-8.8-1.1-12c-3.7-3.7-9.8-3.7-13.5,0
          C-0.9,6.5-0.9,12.6,2.8,16.3z M13.8,5.3c2.3,2.3,2.3,6.2,0,8.5s-6.2,2.4-8.5,0c-2.3-2.3-2.3-6.2,0-8.5S11.5,2.9,13.8,5.3z"/>
        </svg>
        Chercher
      </div>

      <!-- <input type="text" placeholder="nom du projet"/> -->
    </div>

    <div>
      <label>Organiser</label>
      <div class="">
        <div class="">
          <label class="">
            {{ $t('sort_by') }}
          </label>
          <div class="margin-sides-negative-small">
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.current.type = 'alph', sort.current.field = 'name'"
            :class="{ 'is--active' : sort.current.field === 'name' }"
            >
              {{ $t('name') }}
            </button>
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.current.type = 'date', sort.current.field = 'created'"
            :class="{ 'is--active' : sort.current.field === 'created' }"
            >
              {{ $t('created_date') }}
            </button>
          </div>
        </div>

        <div class="margin-vert-small">
          <label class="margin-none text-cap">
            {{ $t('in_the_order') }}
          </label>
          <div class="margin-sides-negative-small">
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.current.order = 'ascending'"
            :class="{ 'is--active' : sort.current.order === 'ascending' }"
            >
              {{ $t('ascending') }}
            </button>
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.current.order = 'descending'"
            :class="{ 'is--active' : sort.current.order === 'descending' }"
            >
              {{ $t('descending') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div>
      MOT-CLÉ
    </div>

    <div>
      AUTEUR
    </div>
  </div>
</template>
<script>


export default {
  props: {
    currentFilter: String,
    currentSort: Object,
  },
  components: {
  },
  data() {
    return {
      filter: this.currentFilter,
      sort: {
        current: this.currentSort,
        available: [
          {
            field: 'date_created',
            name: this.$t('date'),
            type: 'date',
            order: 'ascending'
          },
          {
            field: 'date_modified',
            name: this.$t('last_modified'),
            type: 'date',
            order: 'descending'
          },
          {
            field: 'caption',
            name: this.$t('caption'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'type',
            name: this.$t('type'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'keywords',
            name: this.$t('keywords'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'authors',
            name: this.$t('author'),
            type: 'alph',
            order: 'ascending'
          },
          {
            field: 'content',
            name: this.$t('content'),
            type: 'alph',
            order: 'ascending'
          }
        ]
      }
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    localSort: function() {
      // this.$emit('setSort', this.sort.current);
    },
    localFilter: function() {
      this.$emit('setFilter', this.filter);
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
<style>

</style>