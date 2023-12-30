const { Bonjour: BonjourService } = require("bonjour-service");

module.exports = (function () {
  return {
    init: async ({ name, protocol, port, host = "dodoc.local" }) => {
      dev.logfunction({ name, protocol, port, host });

      let bonjour = new BonjourService();
      const service = bonjour.publish({
        name,
        type: protocol,
        port,
        host,
      });

      service.on("up", () => {});
      service.start();

      // TODO destroy
      // if (bonjour) {
      //   bonjour.unpublishAll(() => {
      //     bonjour.destroy();
      //   });
      // }
    },

    // setUpSSDP({ port }) {
    //   this.ssdpServer = new nodessdp.Server({
    //     location: {
    //       port,
    //     },
    //   });

    //   this.ssdpServer.addUSN("upnp:rootdevice");
    //   this.ssdpServer.addUSN(
    //     "uuid:" + Tools.GET_SYSTEM_ID() + "::upnp:rootdevice"
    //   );

    //   this.ssdpServer.start((err) => {
    //     if (err) {
    //       Logger.warn("Error while starting SSDP/UPnP advertisement", err);
    //     } else {
    //       Logger.info("SSDP/UPnP advertisement started");
    //     }
    //   });
    // },
  };
})();
