var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');

var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');

var dodocAPI = require('./dodoc-api.js');

var dodocFolder = module.exports = {

  plip: function() {
    return 'plop';
  },

  /********************************************* SHORT FUNCTIONS *********************************************/
  getFolderPath: function(slugFolderName) {
    slugFolderName = slugFolderName === undefined ? '' : slugFolderName;
    return path.join(dodocAPI.getUserPath(), dodoc.contentDirname, slugFolderName);
  },
  getMetaFileOfFolder: function( slugFolderName) {
    dev.logfunction( "COMMON — getMetaFileOfFolder");
    return path.join( dodocFolder.getFolderPath(slugFolderName), dodoc.folderMetafilename + dodoc.metaFileext);
  },
  getFolderMeta: function( slugFolderName) {
    dev.logfunction( "COMMON — getFolderMeta");
    var folderMetaFile = dodocFolder.getMetaFileOfFolder( slugFolderName);
    var folderData = fs.readFileSync( folderMetaFile,dodoc.textEncoding);
    var folderMetadata = dodocAPI.parseData( folderData);
    return folderMetadata;
  },



  /********************************************* LONG FUNCTIONS *********************************************/

  createNewFolder: function( folderData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewFolder");

      var folderName = folderData.name;
      var slugFolderName = slugg(folderName);
      var folderPath = dodocFolder.getFolderPath( slugFolderName);
      var currentDateString = dodocAPI.getCurrentDate();

      fs.access( folderPath, fs.F_OK, function( err) {
        // if there's nothing at path
        if(err) {
          console.log("New folder created with name " + folderName + " and path " + folderPath);
          fs.ensureDirSync(folderPath);//write new folder in folders
          var fmeta =
            {
              "name" : folderName,
              "created" : currentDateString,
              "modified" : currentDateString,
              "statut" : "en cours",
            };
          dodocAPI.storeData( dodocFolder.getMetaFileOfFolder( slugFolderName), fmeta, "create").then(function( meta) {
            resolve( meta);
          });

        } else {
          // if there's already something at path
          console.log("WARNING - the following folder name already exists: " + slugFolderName);
          var objectJson = {
            "name": folderName,
            "timestamp": currentDateString
          };
          reject( objectJson);
        }
      });

    });
  },

  listAllFolders: function() {
    return new Promise(function(resolve, reject) {
      fs.readdir( dodocFolder.getFolderPath(), function (err, filenames) {
        if (err) return console.log( 'Couldn\'t read content dir : ' + err);

        var folders = filenames.filter( function(slugFolderName){ return new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName); });
        dev.logverbose( "Number of folders in " + dodocFolder.getFolderPath() + " = " + folders.length + ". Folders are " + folders);

        var foldersProcessed = 0;
        var allFoldersData = [];
        folders.forEach( function( slugFolderName) {

          if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugFolderName)
          && slugFolderName.indexOf( dodoc.deletedPrefix)){
            var fmeta = dodocFolder.getFolderMeta( slugFolderName);
            fmeta.slugFolderName = slugFolderName;
            allFoldersData.push( fmeta);
          }

          foldersProcessed++;
          if( foldersProcessed === folders.length && allFoldersData.length > 0) {
            dev.logverbose( "- - - - all folders JSON have been processed.");
            resolve( allFoldersData);
          }
        });
      });
    });
  },

  removeFolderNamed: function(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — removeFolderNamed : " + JSON.stringify(slugFolderName, null, 4));
      var folderPath = dodocFolder.getFolderPath( slugFolderName);
      var deletedFolderPath = dodocFolder.getFolderPath( dodoc.deletedPrefix + slugFolderName);

      fs.rename( folderPath, deletedFolderPath, function(err) {
        if (err) reject( err);
        var removedFolderData = { "slugFolderName" : slugFolderName };
        resolve( removedFolderData);
      });
    });
  },


  // accepts a folderData with at least a "name" and a "slugFolderName"
  updateFolderMeta: function(folderData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — updateFolderMeta");

      var isNameChanged = folderData.newName !== undefined;
      var slugFolderName = folderData.slugFolderName;
      var currentDateString = dodocAPI.getCurrentDate();
      var newStatut = folderData.statut;
      // récupérer les infos sur le folder
      var fmeta = dodocFolder.getFolderMeta( slugFolderName);
      // éditer les métas récupéré
      if( isNameChanged)
        fmeta.name = folderData.newName;
      if( newStatut !== undefined)
        fmeta.statut = newStatut;
      fmeta.modified = currentDateString;
      // envoyer les changements dans le JSON du folder
      dodocAPI.storeData( dodocFolder.getMetaFileOfFolder( slugFolderName), fmeta, "update").then(function( ufmeta) {
        ufmeta.slugFolderName = slugFolderName;
        resolve( ufmeta);
      });
    });
  },

  listAllProjectsOfOneFolder: function(slugFolderName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "EVENT — listAllProjectsOfOneFolder : " + slugFolderName);
      var folderPath = dodocFolder.getFolderPath( slugFolderName);

      // list all projects
      fs.readdir( folderPath, function (err, projects) {

        if (err) reject( err);
        if (projects === undefined) reject( 'no projet in this folder');
        dev.logverbose( "- number of files and folders in " + folderPath + " = " + projects.length + ". They are " + projects);
        var projectsProcessed = 0;
        var allProjectsData = [];
        projects.forEach( function( slugProjectName) {
          if( new RegExp( dodoc.regexpMatchFolderNames, 'i').test( slugProjectName) && slugProjectName.indexOf( dodoc.deletedPrefix)){

            var dodocProject = require('./dodoc-project.js');
            var pdata = dodocProject.getProjectMeta( slugFolderName, slugProjectName);
            var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);
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
  },

};