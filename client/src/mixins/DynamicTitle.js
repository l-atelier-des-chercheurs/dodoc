// Mixin for dynamic document title management in views
export default {
  methods: {
    // Method to update document title with instance name
    updateDocumentTitle(titlePart) {
      const instanceName = window.app_infos?.instance_meta?.name || "do•doc";
      if (titlePart) {
        document.title = `${titlePart} - ${instanceName}`;
      } else {
        document.title = instanceName;
      }
    },
  },
};
