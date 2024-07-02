export default {
  computed: {},
  methods: {
    updatePageQuery({ prop, val }) {
      let query = {};
      if (this.$route.query)
        query = JSON.parse(JSON.stringify(this.$route.query));
      if (val === false) delete query[prop];
      else if (val !== undefined) query[prop] = val;
      this.$router.push({ query });
    },
  },
};
