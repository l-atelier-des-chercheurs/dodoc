<template>
  <div class="m_accessJournal">
    <!-- <div class="switch switch-xs">
      <input
        class="switch"
        id="showReturning"
        type="checkbox"
        v-model="show_returning"
      />
      <label for="showReturning" class="">
        {{ $t("show_returning_visitors") }}
      </label>
    </div> -->

    <label class="_visitorsNew">
      {{ $t("new_visitors") }}
    </label>
    <label class="_visitorsReturning">
      {{ $t("returning_visitors") }}
    </label>

    <table class="table-bordered margin-vert-verysmall">
      <thead>
        <tr>
          <th>{{ $t("date") }}</th>
          <th>{{ $t("visitors") }}</th>
          <th>{{ $t("new") }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="Object.keys(aggregated_days).length === 0"
          class="bg-gris_tresclair"
        >
          <td colspan="4">
            <small class>{{ $t("no_content_to_show") }}</small>
          </td>
        </tr>

        <tr
          v-for="(counts, day) in aggregated_days"
          :key="day"
          class="_singleDay font-small"
        >
          <td class="_singleDay--day">{{ day }}</td>
          <td class="_singleDay--count">
            <span class="_visitorsNew">{{ counts.new }}</span> +
            <span class="_visitorsReturning">{{ counts.returning }}</span> =
            <span class="">{{ counts.total }}</span>
          </td>
          <td class="_singleDay--bar">
            <div
              class="_singleDay--bar--new _visitorsNew"
              :style="barStyle(counts.new)"
            />
            <div
              class="_singleDay--bar--returning _visitorsReturning"
              :style="barStyle(counts.returning)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
export default {
  props: {
    access_entries: Array,
  },
  components: {},
  data() {
    return {};
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
          // if (!this.show_returning && visitors.includes(id)) return acc;

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
}

._singleDay--bar {
  position: relative;
  flex: 1 1 auto;

  display: flex;

  > * {
    height: 1.5em;
  }
}

._visitorsNew {
  background: var(--color-bar-new);
}
._visitorsReturning {
  background: var(--color-bar-returning);
}
._singleDay--count {
}
</style>
