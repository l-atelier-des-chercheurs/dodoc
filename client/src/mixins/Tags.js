export default {
  computed: {},
  methods: {
    isTranslated(tag_type) {
      return ["level", "disciplines", "target_audience"].includes(tag_type);
    },
    translatedPrefix(tag_type) {
      if (this.isTranslated(tag_type))
        if (tag_type === "disciplines") return "di_";
        else if (tag_type === "target_audience") return "ta_";
      return;
    },
  },
};
