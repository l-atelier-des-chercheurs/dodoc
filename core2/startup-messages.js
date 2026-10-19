// messages shown in electron dialogs before the client (and its i18n) is loaded,
// translated according to the OS language

const messages = {
  en: {
    failed_to_start: "Failed to start the application",
    error: "Error: {error}",
    bonjour_domain_must_be_string: "The Bonjour domain must be a string.",
    failed_to_write_content_path: "Failed to write to content path: {path}",
    failed_to_write_content_path_details:
      "Please check if the path is correct and if you have the necessary permissions to write to it. do•doc will start with the default Documents/dodoc folder.",
    content_folder_incompatible_title: "This content folder can’t be used",
    content_folder_incompatible:
      "The folder {path} is not empty and was not created by do•doc 10. Nothing was changed in it.\n\n" +
      "Choose an empty folder, for example a new subfolder ({subfolder}): use the “New Folder” button in the selection window, then select it. " +
      "You can also choose an existing do•doc 10 content folder.",
    choose_another_folder: "Choose another folder…",
    use_default_folder: "Use the default folder",
    quit: "Quit",
  },
  fr: {
    failed_to_start: "Impossible de démarrer l’application",
    error: "Erreur : {error}",
    bonjour_domain_must_be_string:
      "Le domaine Bonjour doit être une chaîne de caractères.",
    failed_to_write_content_path:
      "Impossible d’écrire dans le dossier de contenu : {path}",
    failed_to_write_content_path_details:
      "Vérifiez que le chemin est correct et que vous avez les droits d’écriture. do•doc va démarrer avec le dossier par défaut Documents/dodoc.",
    content_folder_incompatible_title: "Ce dossier de contenu ne peut pas être utilisé",
    content_folder_incompatible:
      "Le dossier {path} n’est pas vide et n’a pas été créé par do•doc 10. Rien n’y a été modifié.\n\n" +
      "Choisissez un dossier vide, par exemple un nouveau sous-dossier ({subfolder}) : utilisez le bouton « Nouveau dossier » de la fenêtre de sélection, puis sélectionnez-le. " +
      "Vous pouvez aussi choisir un dossier de contenu do•doc 10 existant.",
    choose_another_folder: "Choisir un autre dossier…",
    use_default_folder: "Utiliser le dossier par défaut",
    quit: "Quitter",
  },
  it: {
    failed_to_start: "Impossibile avviare l’applicazione",
    error: "Errore: {error}",
    bonjour_domain_must_be_string:
      "Il dominio Bonjour deve essere una stringa di caratteri.",
    failed_to_write_content_path:
      "Impossibile scrivere nella cartella dei contenuti: {path}",
    failed_to_write_content_path_details:
      "Verifica che il percorso sia corretto e di avere i permessi di scrittura. do•doc si avvierà con la cartella predefinita Documents/dodoc.",
    content_folder_incompatible_title:
      "Questa cartella dei contenuti non può essere usata",
    content_folder_incompatible:
      "La cartella {path} non è vuota e non è stata creata da do•doc 10. Non è stato modificato nulla.\n\n" +
      "Scegli una cartella vuota, per esempio una nuova sottocartella ({subfolder}): usa il pulsante «Nuova cartella» della finestra di selezione, poi selezionala. " +
      "Puoi anche scegliere una cartella dei contenuti do•doc 10 esistente.",
    choose_another_folder: "Scegli un’altra cartella…",
    use_default_folder: "Usa la cartella predefinita",
    quit: "Esci",
  },
};

function getLang() {
  if (!global.is_electron) return "en";
  try {
    const { app } = require("electron");
    const preferred = [
      ...(app.getPreferredSystemLanguages?.() || []),
      app.getLocale(),
    ];
    for (const locale of preferred) {
      const lang = (locale || "").slice(0, 2).toLowerCase();
      if (messages[lang]) return lang;
    }
  } catch (err) {}
  return "en";
}

module.exports = function t(key, vars = {}, lang = getLang()) {
  const str = messages[lang][key] || messages.en[key] || key;
  return str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
};
