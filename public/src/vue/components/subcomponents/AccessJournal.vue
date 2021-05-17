<template>
  <div>
    <!-- {{ access_entries }} -->
    <fusioncharts
      :type="type"
      :width="width"
      :height="height"
      :dataFormat="dataFormat"
      :dataSource="dataSource"
    />
  </div>
</template>
<script>
var jsonify = (res) => res.json();

export default {
  props: {
    access_entries: Array,
  },
  components: {},
  data() {
    return {
      width: "100%",
      height: "400",
      type: "timeseries",
      dataFormat: "json",
      dataSource: {
        data: null,
        caption: {
          text: "Sales Analysis",
        },
        subcaption: {
          text: "Grocery",
        },
        yAxis: [
          {
            plot: {
              value: "Grocery Sales Value",
              type: "line",
            },
            format: {
              prefix: "$",
            },
            title: "Sale Value",
          },
        ],
      },
    };
  },
  created() {},
  mounted() {
    const data = this.$_.countBy(this.access_entries, function ({ timestamp }) {
      const js_date = new Date(+timestamp);
      const date =
        js_date.getDate() +
        "-" +
        (js_date.getMonth() + 1) +
        "-" +
        js_date.getFullYear();
      return date;
    });

    debugger;

    const fusionTable = new FusionCharts.DataStore().createDataTable(
      Object.entries(data),
      // [
      //   ["01-Feb-11", 8866],
      //   ["02-Feb-11", 2174],
      //   ["03-Feb-11", 2084],
      //   ["04-Feb-11", 1503],
      //   ["05-Feb-11", 4928],
      // ],
      [
        {
          name: "Time",
          type: "date",
          format: "%d-%m-%Y",
        },
        {
          name: "Grocery Sales Value",
          type: "number",
        },
      ]
    );
    this.dataSource.data = fusionTable;
  },
  beforeDestroy() {},
  watch: {},
  computed: {},
  methods: {},
};
</script>
<style lang="scss" scoped></style>
