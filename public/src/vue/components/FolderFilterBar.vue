<template>
  <div class="m_filterBar margin-vert-medium">
    <div>
      RECHERCHE
      <input type="text" placeholder="nom du projet"/>
    </div>

    <div>
      ORDRE
      <div class="border border-top-dashed">
        <div class="margin-vert-medium">
          <label class="margin-none text-cap with-bullet">
            {{ $t('sort_by') }}
          </label>
          <div class="margin-sides-negative-small">
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.type = 'alph', sort.field = 'name'"
            :class="{ 'is--active' : sort.field === 'name' }"
            >
              {{ $t('name') }}
            </button>
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.type = 'date', sort.field = 'created'"
            :class="{ 'is--active' : sort.field === 'created' }"
            >
              {{ $t('created_date') }}
            </button>
          </div>
        </div>

        <div class="margin-vert-small">
          <label class="margin-none text-cap with-bullet">
            {{ $t('in_the_order') }}
          </label>
          <div class="margin-sides-negative-small">
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.order = 'ascending'"
            :class="{ 'is--active' : sort.order === 'ascending' }"
            >
              {{ $t('ascending') }}
            </button>
            <button 
            type="button" 
            class="border-circled button-thin button-wide padding-verysmall margin-verysmall" 
            @click="sort.order = 'descending'"
            :class="{ 'is--active' : sort.order === 'descending' }"
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
    filter: String,
    sort: Object,
  },
  components: {
  },
  data() {
    return {
      currentSort: this.sort.current,
      currentFilter: this.filter,
    }
  },
  
  created() {
  },
  mounted() {
  },
  beforeDestroy() {
  },

  watch: {
    currentSort: function() {
      this.$emit('setSort', this.currentSort);
    },
    currentFilter: function() {
      this.$emit('setFilter', this.currentFilter);
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