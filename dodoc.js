

var dodoc = (function() {
  let currentCodeLang = 'en';
  let settings = require('./settings.json');
  let lang;

  // set lang here
  const API = {
    init               : ()   => { return init() },
    setCurrentCodeLang     : (codeLang)   => { return setLang(codeLang) },
    getCurrentCodeLang     : () => { return currentCodeLang },
    lang               : () => { return lang },
    settings           : () => { return settings; },
  };

  function setLang(codeLang) {
    // detect fr, fr-BE, fr-CA, etc.
    console.log('codelang ' + codeLang);
    if(codeLang.indexOf('fr') === 0) {
      currentCodeLang = 'fr';
    } else {
      currentCodeLang = 'en';
    }
    init();
  }

  function init() {
    if(currentCodeLang === 'fr') {
      lang = Object.assign(require('./lang.default.json'), require('./lang.fr.json'));
    } else {
      lang = require('./lang.default.json');
    }
  }

  return API;
})();

try {
  module.exports = dodoc;
} catch(err) {

}