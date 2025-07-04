export default {
  methods: {
    twoStringsMatch(ref, input) {
      // if (input === "") return true;
      const _ref = this.normalizeStringForSearch(ref);
      const _input = this.normalizeStringForSearch(input);
      return _ref.startsWith(_input);
    },
    twoStringsSearch(ref, input) {
      // if (input === "") return true;
      const _ref = this.normalizeStringForSearch(ref);
      const _input = this.normalizeStringForSearch(input);
      return _ref.includes(_input);
    },
    normalizeStringForSearch(str) {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    },
    cleanUpString(str) {
      return str.replace(/^[\s\r\n]+|[\s\r\n]+$/g, "");
    },
  },
};
