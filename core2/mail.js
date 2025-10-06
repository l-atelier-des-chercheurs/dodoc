const nodemailer = require("nodemailer");

const dev = require("./dev-log");

module.exports = (function () {
  const API = {
    /**
     * Send an email using SMTP settings from settings.json
     * @param {Object} options - { to, subject, text, html }
     * @returns {Promise}
     */
    async sendMail({ to, subject, text = "", html = "" }) {
      if (!global.settings.mailer?.host) {
        const err = new Error("Mailer settings are not defined");
        err.code = "mailer_settings_not_defined";
        throw err;
      }

      if (dev.isDebug()) {
        // mock sending email
        const info = {
          messageId: "mocked-message-id",
          envelope: {
            to: [to],
          },
        };
        dev.log("Mocked email sent:", info.messageId);
        return info;
      }

      const { host, port, secure, auth, from } = global.settings.mailer;

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth,
      });
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      console.log("Mail sent:", info.messageId);

      return info;
    },

    /**
     * Check if mail settings are configured
     * @returns {boolean}
     */
    canSendMail() {
      if (!global.settings.mailer?.host || !global.settings.url) {
        dev.log(
          "Mailer settings are not defined, make sure to set them in settings.json (mailer + url fields)"
        );
        return false;
      }
      return true;
    },
  };

  return API;
})();
