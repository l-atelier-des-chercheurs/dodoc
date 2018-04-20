const dev = require('./dev-log'),
  file = require('./file');

module.exports = (function() {
  // This var stores all session ID and the folder they are authorized to edit
  let users_auth = {};

  const API = {
    setAuthenticate: (sessionId, admin_access) =>
      setAuthenticate(sessionId, admin_access),
    hasFolderAuth: (sessionId, foldersData) =>
      hasFolderAuth(sessionId, foldersData),
    filterFolders: (sessionId, foldersData) =>
      filterFolders(sessionId, foldersData),
    filterMedias: mediasData => filterMedias(mediasData)
  };

  function setAuthenticate(sessionId, admin_access) {
    return new Promise(function(resolve, reject) {
      dev.logverbose(`setAuthenticate for ${sessionId}.`);
      users_auth[sessionId] = [];

      if (admin_access === undefined || admin_access === {}) {
        dev.logverbose(`No admin data, resolving immediately.`);
        reject();
      } else {
        // get all folders slugs and passwords
        file
          .getFolder({ type: 'projects' })
          .then(foldersData => {
            // compare with data we received
            for (let slugFolderName in foldersData) {
              if (admin_access[slugFolderName]) {
                if (
                  admin_access[slugFolderName] ===
                  foldersData[slugFolderName].password
                ) {
                  dev.logverbose(`Password fit for ${slugFolderName}.`);
                  users_auth[sessionId].push(slugFolderName);
                } else {
                  dev.logverbose(`Password is wrong for ${slugFolderName}.`);
                }
              }
            }
            dev.log(`Authentificated a new user ${sessionId}.`);
            dev.log(
              `Authorized to edit: ${
                users_auth[sessionId] ? users_auth[sessionId].join() : ''
              }`
            );
            resolve(users_auth[sessionId]);
          })
          .catch(err => {
            dev.error(`Failed to get folder data: ${err}`);
            reject(err);
          });
      }
    });
  }

  function hasFolderAuth(sessionId, foldersData) {
    dev.logfunction(`AUTH — hasFolderAuth`);
    let slugFolderName = Object.keys(foldersData)[0];

    // disabling for now
    return true;

    if (
      (users_auth[sessionId] !== undefined &&
        users_auth[sessionId].indexOf(slugFolderName) >= 0) ||
      (foldersData[slugFolderName].hasOwnProperty('password') &&
        foldersData[slugFolderName].password === '')
    ) {
      dev.logverbose(`AUTH — hasFolderAuth: accepted`);
      return true;
    }
    dev.logverbose(`AUTH — hasFolderAuth: refused`);
    return false;
  }

  function filterFolders(sessionId, foldersData) {
    dev.logfunction(
      `AUTH — filtering folders data for ${sessionId} and users_auth ${
        users_auth[sessionId]
      }.`
    );

    if (foldersData === undefined) {
      return;
    }

    // we do this in order not to touch the original foldersData
    let filteredFoldersData = JSON.parse(JSON.stringify(foldersData));

    for (let slugFolderName in filteredFoldersData) {
      // find if sessionID has this folder
      if (hasFolderAuth(sessionId, filteredFoldersData)) {
        dev.logverbose(
          `For ${sessionId}, admin access authorized for ${slugFolderName}.`
        );
        filteredFoldersData[slugFolderName].authorized = true;
      } else {
        dev.logverbose(
          `For ${sessionId}, admin access refused for ${slugFolderName}.`
        );
        filteredFoldersData[slugFolderName].authorized = false;
      }
    }
    return filteredFoldersData;
  }

  function filterMedias(mediasData) {
    dev.logfunction(`AUTH — filtering medias data.`);

    if (mediasData === undefined) {
      return;
    }

    // we do this in order not to touch the original mediasData
    let filteredMediasData = JSON.parse(JSON.stringify(mediasData));

    // is public user (remove all non-public medias)
    for (let slugMediaName in mediasData) {
      if (
        !mediasData[slugMediaName].hasOwnProperty('public') ||
        !(
          mediasData[slugMediaName].public === true ||
          mediasData[slugMediaName].public === 'true'
        )
      ) {
        dev.logverbose(`Removing media ${slugMediaName} for public user`);
        delete filteredMediasData[slugMediaName];
      }
    }

    return filteredMediasData;
  }

  return API;
})();
