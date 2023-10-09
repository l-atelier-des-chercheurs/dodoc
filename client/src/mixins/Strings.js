export default {
  methods: {
    twoStringsMatch(ref, input) {
      // if (input === "") return true;
      const _ref = this.normalizeStringForSuggestions(ref);
      const _input = this.normalizeStringForSuggestions(input);
      return _ref.startsWith(_input);
    },

    normalizeStringForSuggestions(str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    },
  },
};
