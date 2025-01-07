const utils = require("./utils");

module.exports = (function () {
  return {
    allowed: (req, res, next) => {
      const local_origins = ["localhost"];
      const local_ips = utils.getLocalIPs();

      // localhost and local IPs are allowed to fetch anything
      if (
        local_origins.find((o) => req.host.startsWith(o)) ||
        local_ips.find((ip) => req.host.startsWith(ip))
      )
        return true;

      // other domain need to be allowed to fetch ressource files
      const file_types = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".mp4",
        ".webm",
        ".mov",
        ".mp3",
        ".wav",
        ".ogg",
        ".pdf",
      ];

      const filetype_is_allowed = file_types.find((ext) =>
        req.path.toLowerCase().includes(ext)
      );

      const allowed_domains = ["reddit.com"];
      if (
        filetype_is_allowed &&
        allowed_domains.find((d) => req.host.startsWith(d))
      )
        return true;
      return false;
    },
  };
})();
