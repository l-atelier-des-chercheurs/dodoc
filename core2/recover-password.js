const utils = require("./utils");
const auth = require("./auth");
const folder = require("./folder");

module.exports = (function () {
  const API = {
    recoverPassword: async ({ path_to_folder }) => {
      dev.logfunction({ path_to_folder });

      // get folder meta
      let folder_meta = await utils
        .readMetaFile(path_to_folder, "meta.txt")
        .catch((err) => {
          throw err;
        });

      if (!folder_meta.hasOwnProperty("email") || folder_meta.email === "") {
        const err = new Error("Folder doesn't have email");
        err.code = "no_email_for_folder";
        throw err;
      }

      // generate a token that will be able to edit a folder at path path_to_folder
      const reset_token = await auth.createAndStoreToken({
        path_to_folder,
        purpose: "password_reset",
        expires_in_minutes: 60, // Token expires in 1 hour
      });

      // we generate a token/link instead of a new password, to make sure someone else is not
      // abusing and changing password for other accounts…
      try {
        const encoded_path_to_folder = encodeURIComponent(path_to_folder);
        const reset_link = `${global.settings.url}/reset-password?token=${reset_token}&path=${encoded_path_to_folder}`;
        return utils.sendMail({
          to: folder_meta.email,
          ...createEmailContent({ reset_link }),
        });
      } catch (err) {
        throw err;
      }
    },

    resetPassword: async ({
      path_to_type,
      path_to_folder,
      token,
      new_password,
    }) => {
      dev.logfunction({ path_to_folder });

      try {
        if (!token || !new_password) {
          const err = new Error("Token and new password are required");
          err.code = "missing_required_fields";
          throw err;
        }

        auth.checkTokenValidity({
          token,
          token_path: path_to_folder,
          purpose: "password_reset",
        });

        const changed_data = await folder.updateFolder({
          path_to_type,
          path_to_folder,
          data: { $password: new_password },
        });

        // Revoke the reset token after use
        await auth.revokeToken({ token_to_revoke: token });

        dev.logpackets({ status: "password was reset" });
        return { status: "ok" };
      } catch (err) {
        throw err;
      }
    },
  };

  function createEmailContent({ reset_link }) {
    return {
      subject: "Reset your password / Réinitialisation de votre mot de passe",
      text: `Hello,

You have requested to reset your password for your account on ${global.settings.url}.

Please open the following link to set a new password:
${reset_link}

This link will expire in 1 hour.

If you did not request this password reset, you can safely ignore this email.

Best regards,
The do•doc Team

---

Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur ${global.settings.url}.

Veuillez ouvrir le lien suivant dans votre navigateur pour définir un nouveau mot de passe :
${reset_link}

Ce lien expirera dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation de mot de passe, vous pouvez ignorer cet e-mail en toute sécurité.

Cordialement,
L'équipe do•doc`,
      html: `<p>Hello,</p>
<p>You have requested to reset your password for your account on ${global.settings.url}.</p>
<p>Please click on the following link to set a new password:<br>
<a href="${reset_link}">${reset_link}</a></p>
<p>This link will expire in 1 hour.</p>
<p>If you did not request this password reset, you can safely ignore this email.</p>
<p>Best regards,<br>
The Dodoc Team</p>

<hr>

<p>Bonjour,</p>
<p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur ${global.settings.url}.</p>
<p>Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :<br>
<a href="${reset_link}">${reset_link}</a></p>
<p>Ce lien expirera dans 1 heure.</p>
<p>Si vous n'avez pas demandé cette réinitialisation de mot de passe, vous pouvez ignorer cet e-mail en toute sécurité.</p>
<p>Cordialement,<br>
L'équipe do•doc</p>`,
    };
  }

  return API;
})();
