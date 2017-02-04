var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');

var dodoc  = require('../dodoc');
var dodocAPI = require('./dodoc-api');
var dev = require('./dev-log');

var dodocFolder = (function() {
  const API = {
    getMetaFileOfFolder     : (slugFolderName) => { return getMetaFileOfFolder(slugFolderName); },
    createNewFolder         : (folderData)     => { return createNewFolder(folderData); },
    listAllFolders          : ()               => { return listAllFolders(); },
    removeOneFolder         : (folderData)     => { return removeOneFolder(folderData); },
    updateFolderMeta        : (folderData)     => { return updateFolderMeta(folderData); },
    listAllProjectsOfOneFolder: (slugFolderName) => { return listAllProjectsOfOneFolder(slugFolderName); },
  };

  /********************************************* SHORT FUNCTIONS *********************************************/

  function getMetaFileOfFolder( slugFolderName) {
    dev.logfunction( "COMMON — getMetaFileOfFolder: " + slugFolderName);
    return path.join( dodocAPI.getFolderPath(slugFolderName), dodoc.settings().folderMetafilename + dodoc.settings().metaFileext);
  }

  function getFolderMeta( slugFolderName) {
    dev.logfunction( "COMMON — getFolderMeta: " + slugFolderName);
    var folderMetaFile = getMetaFileOfFolder(slugFolderName);
    dev.logfunction( "folderMetaFile: " + folderMetaFile);
    var folderData = fs.readFileSync( folderMetaFile,dodoc.settings().textEncoding);
    var folderMetadata = dodocAPI.parseData( folderData);
    return folderMetadata;
  }

  function createNewFolder(d) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewFolder");

      // list all folders, check their name against the desired name
      listAllFolders().then(function(allFoldersData) {

        let foldersWithSameNameAlreadyExist = undefined;
        if(allFoldersData !== undefined) {
          function findFolderWithSameName(folder) {
            return folder.name === d.name;
          }
          foldersWithSameNameAlreadyExist = allFoldersData.find(findFolderWithSameName) === undefined;
          dev.logverbose('Found folders with same name : ' + foldersWithSameNameAlreadyExist);
          // if no name is found, lets find a slug name not taken and create our folder
        }

        if(allFoldersData === undefined || (allFoldersData !== undefined && foldersWithSameNameAlreadyExist)) {
          let slugFolderName = slugg(d.name);
          var foldersPath = dodocAPI.getFolderPath();
          slugFolderName = dodocAPI.findFirstFilenameNotTaken(slugFolderName, foldersPath, '');
          dev.log("New folder created with name " + d.name + " and slug (folder name) " + slugFolderName);

          var folderPath = dodocAPI.getFolderPath(slugFolderName);
          fs.ensureDirSync(folderPath);

          var currentDateString = dodocAPI.getCurrentDate();
          var fmeta =
            {
              "name" : d.name,
              "created" : currentDateString,
              "modified" : currentDateString,
              "statut" : "en cours",
              "slugFolderName" : slugFolderName,
            };
          dodocAPI.storeData(getMetaFileOfFolder(slugFolderName), fmeta, "create").then(function(meta) {
            resolve( meta);
          }, function(error) {
            dev.error("Failed to create new folder meta! Error: " + error);
            reject();
          });

        } else {
          // otherwise, lets fail with a message to the user
          dev.error("WARNING - the following folder name already exists: " + d.name);
          var objectJson = {
            "name": d.name,
            "timestamp": currentDateString
          };
          reject(objectJson);
        }

      }, function(error) {
        dev.error("Failed to list all folders to create a folder! Error: " + error);
        reject();
      });

    });
  }

  function listAllFolders() {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — listAllFolders");

      fs.readdir( dodocAPI.getFolderPath(), function (err, filenames) {
        if (err) return dev.error(`Couldn't read content dir: ${err}`);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( slugFolderName); });

        if(folders.length === 0) {
          dev.logverbose('No folders found in ' + dodocAPI.getFolderPath());
          resolve();
        }

        dev.logverbose('Number of folders in ' + dodocAPI.getFolderPath() + ' is ' + folders.length + '. Folders are ' + folders);
        var foldersProcessed = 0;
        var allFoldersData = [];
        folders.forEach( function( slugFolderName) {
          dev.logverbose('listAllFolders -- current folder to look into: ' + slugFolderName);
          if( new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( slugFolderName) && slugFolderName.indexOf( dodoc.settings().deletedPrefix)){
            var fmeta = getFolderMeta( slugFolderName);
            fmeta.slugFolderName = slugFolderName;
            allFoldersData.push( fmeta);
          }
          foldersProcessed++;
          if(foldersProcessed === folders.length) {
            dev.logverbose( "- - - - all folders JSON have been processed.");
            resolve( allFoldersData);
          }
        });
      });
    });
  }

  function removeOneFolder(d) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — removeOneFolder: " + JSON.stringify(d, null, 4));

      var folderPath = dodocAPI.getFolderPath(d.slugFolderName);
      var deletedFolderName = dodoc.settings().deletedPrefix + d.slugFolderName;
      deletedFolderName = dodocAPI.findFirstFilenameNotTaken(deletedFolderName, dodocAPI.getFolderPath(), '');
      var deletedFolderPath = dodocAPI.getFolderPath(deletedFolderName);

      fs.rename(folderPath, deletedFolderPath, function(err) {
        if (err) reject( err);
        resolve(d);
      });
    });
  }

  // accepts a folderData with at least a "name" and a "slugFolderName"
  function updateFolderMeta(folderData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — updateFolderMeta");

      var isNameChanged = folderData.newName !== undefined;
      var currentDateString = dodocAPI.getCurrentDate();
      var newStatut = folderData.statut;
      var slugFolderName = folderData.slugFolderName;

      // récupérer les infos sur le folder
      var fmeta = getFolderMeta(folderData.slugFolderName);
      // éditer les métas récupéré
      if( isNameChanged)
        fmeta.name = folderData.newName;
      if( newStatut !== undefined)
        fmeta.statut = newStatut;
      fmeta.modified = currentDateString;
      // envoyer les changements dans le JSON du folder
      dodocAPI.storeData(getMetaFileOfFolder(slugFolderName), fmeta, "update").then(function( ufmeta) {
        ufmeta.slugFolderName = slugFolderName;
        resolve( ufmeta);
      }, function(error) {
        dev.error("Failed to store data ! Error: " + error);
        reject();
      });
    });
  }

  function listAllProjectsOfOneFolder(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "EVENT — listAllProjectsOfOneFolder : " + slugFolderName);
      var folderPath = dodocAPI.getFolderPath( slugFolderName);

      // list all projects
      fs.readdir( folderPath, function (err, projects) {

        if (err) reject( err);
        if (projects === undefined) reject( 'no projet in this folder');
        dev.logverbose( "- number of files and folders in " + folderPath + " = " + projects.length + ". They are " + projects);
        var projectsProcessed = 0;
        var allProjectsData = [];
        projects.forEach( function( slugProjectName) {
          if( new RegExp( dodoc.settings().regexpMatchFolderNames, 'i').test( slugProjectName) && slugProjectName.indexOf( dodoc.settings().deletedPrefix)){

            var dodocProject = require('./dodoc-project.js');
            var pdata = dodocProject.getProjectMeta( slugFolderName, slugProjectName);
            var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
            pdata.slugFolderName = slugFolderName;
            pdata.slugProjectName = slugProjectName;
            pdata.projectPreviewName = dodocProject.getProjectPreview( projectPath);
            allProjectsData.push( pdata);

          }
          projectsProcessed++;
          if( projectsProcessed === projects.length && allProjectsData.length > 0) {
            dev.logverbose( "- - - - all Project JSON have been processed.");
            resolve( allProjectsData);
          }
        });
      });
    });
  }

  return API;
})();

module.exports = dodocFolder;