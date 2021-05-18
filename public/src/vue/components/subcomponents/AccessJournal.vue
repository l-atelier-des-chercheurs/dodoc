<template>
  <div class="m_accessJournal">
    <div class="switch switch-xs">
      <input
        class="switch"
        id="showReturning"
        type="checkbox"
        v-model="show_returning"
      />
      <label for="showReturning" class="">
        {{ $t("show_returning_visitors") }}
      </label>
    </div>

    <div v-for="(counts, day) in aggregated_days" :key="day" class="_singleDay">
      <div class="_singleDay--day">
        {{ day }}
      </div>
      <div class="_singleDay--bar">
        <div class="_singleDay--bar--new" :style="barStyle(counts.new)" />
        <div
          v-if="show_returning"
          class="_singleDay--bar--returning"
          :style="barStyle(counts.returning)"
        />
      </div>
      <div class="_singleDay--count">{{ counts.total }}</div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    access_entries: Array,
  },
  components: {},
  data() {
    return {
      show_returning: false,
    };
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  watch: {},
  computed: {
    aggregated_days() {
      /*
      {
        "10 janvier 2021": { 
          new: 0,
          returning: 0,
          ids: {} 
        },
        "6 mai 2021": { 
          ids: {} 
        },
        "17 mai 2021": { ids: {} },
        "18 mai 2021": { ids: {} },
      };
      */

      const visitors = [];

      return this.access_entries.reduce(
        (acc, { timestamp, ip, user_agent }) => {
          const id = ip + "|" + user_agent;
          if (!this.show_returning && visitors.includes(id)) return acc;

          const date = this.$moment(+timestamp).format("LL");
          if (!acc.hasOwnProperty(date))
            acc[date] = { new: 0, returning: 0, total: 0 };

          if (!visitors.includes(id)) {
            acc[date].new++;
          } else {
            acc[date].returning++;
          }
          acc[date].total = acc[date].new + acc[date].returning;

          visitors.push(id);

          return acc;
        },
        {}
      );

      // return this.$_.countBy(this.access_entries, function ({ timestamp }) {
      //   const js_date = new Date(+timestamp);
      //   const date =
      //     js_date.getDate() +
      //     "-" +
      //     (js_date.getMonth() + 1) +
      //     "-" +
      //     js_date.getFullYear();
      //   return date;
      // });
    },

    max_visitors() {
      const values = Object.values(this.aggregated_days).map(
        ({ total }) => total
      );
      return Math.max(...values);
    },
  },
  methods: {
    barStyle(count) {
      return {
        width: (count / this.max_visitors) * 100 + "%",
      };
    },
  },
};
</script>
<style lang="scss" scoped>
.m_accessJournal {
  --color-bar-new: var(--c-rouge_clair);
  --color-bar-returning: var(--c-bleuvert);
}

._singleDay {
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: stretch;

  font-size: var(--font-size-small);
  font-family: Fira Mono;
  text-transform: lowercase;
  letter-spacing: 0.05em;

  padding-top: 2px;
  padding-bottom: 2px;

  &:hover {
    background-color: #eee;
  }
}

._singleDay--day {
  width: 12em;
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;
}

._singleDay--bar {
  position: relative;
  flex: 1 1 auto;

  display: flex;
  flex-flow: row nowrap;

  > * {
    height: 1.5em;
  }
}

._singleDay--bar--new {
  background: var(--color-bar-new);
}
._singleDay--bar--returning {
  background: var(--color-bar-returning);
}
._singleDay--count {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 4em;
}
</style>
