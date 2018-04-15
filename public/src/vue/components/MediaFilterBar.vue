<template>
  <div class="m_filterBar">
    <div>
      ORDRE
      <!-- <div class="">
        <div class="">
          <label class="margin-none text-cap">
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
      </div> -->
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
      this.$emit('setSort', this.localSort);
    },
    localFilter: function() {
      this.$emit('setFilter', this.localFilter);
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