var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');
var dev = require('./dev-log');

var dodocProject = (function() {

  const API = {
    getMetaFileOfProject     : (slugFolderName, slugProjectName) => { return getMetaFileOfProject(slugFolderName, slugProjectName); },
    getProjectMeta           : (slugFolderName, slugProjectName) => { return getProjectMeta(slugFolderName, slugProjectName); },
    createNewProject         : (pdata) => { return createNewProject(pdata); },
    getProjectPreview        : (projectPath) => { return getProjectPreview(projectPath); },
    updateProjectMeta        : (pdata) => { return updateProjectMeta(pdata); },
    listOneProject           : (slugFolderName, slugProjectName) => { return listOneProject(slugFolderName, slugProjectName); },
    removeOneProject         : (slugFolderName, slugProjectName) => { return removeOneProject(slugFolderName, slugProjectName); },
    addProjectPreview        : (projectPath, imageData) => { return addProjectPreview(projectPath, imageData); },
  };

  /***************************************************************************************************/
  /******************************************** public functions *************************************/
  /***************************************************************************************************/

  function getMetaFileOfProject( slugFolderName, slugProjectName) {
    return path.join( dodocAPI.getProjectPath( slugFolderName, slugProjectName), dodoc.settings().projectMetafilename + dodoc.settings().metaFileext);
  }
  function getProjectMeta(slugFolderName, slugProjectName) {
//    dev.log( "getProjectMeta with slugFolderName : " + slugFolderName + " slugProjectName : " + slugProjectName);
    var projectJSONFile = getMetaFileOfProject( slugFolderName, slugProjectName);
    var pdata = fs.readFileSync( projectJSONFile, dodoc.settings().textEncoding);
    var projectJSONdata = dodocAPI.parseData(pdata);

    return projectJSONdata;
  }
  function createNewProject( pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewProject");

      var projectName = pdata.projectName;
      var slugProjectName = slugg( projectName);
      var slugFolderName = pdata.slugFolderName;

      var currentDateString = dodocAPI.getCurrentDate();
      var dodocFolder = require('./dodoc-folder.js');
      var pathToFolder = dodocAPI.getFolderPath( slugFolderName);

      // Vérifie si le projet existe déjà, change son slug si besoin
      slugProjectName = dodocAPI.findFirstFilenameNotTaken( slugProjectName, pathToFolder, '');
      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);

      dev.log("New project created with name " + projectName + " and path " + projectPath);
      fs.ensureDirSync(projectPath);//new project

      var dodocMedia = require('./dodoc-media.js');
      var mediaFolders = dodocMedia.getAllMediasFoldersPathAsArray();
      mediaFolders.forEach( function(mediaFolder) {
        fs.ensureDirSync(path.join( projectPath, mediaFolder));//write new medias folder in folders
      });
      fs.ensureDirSync(path.join(projectPath, dodoc.settings().projectPublisFoldername));//write new publi folder in folders

      var pmeta =
        {
          "name" : projectName,
          "created" : currentDateString,
          "modified" : currentDateString,
          "statut" : "en cours",
          "informations" : 0
        };

      dodocAPI.storeData(getMetaFileOfProject(slugFolderName, slugProjectName), pmeta, "create").then(function( meta) {
        dev.logverbose('Just stored new project data, returning this data to client');
        var updatedpmeta = getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;

        addProjectPreview(projectPath, pdata.imageData)
        .then(err => {
          updatedpmeta.projectPreviewName = getProjectPreview(projectPath);
          resolve(updatedpmeta);
        });
      });
    });
  }

  // accepts a folderData with at least a "foldername", a "slugFolderName", a "projectname" and a "slugProjectName"
  function updateProjectMeta(pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — updateProjectMeta : " + JSON.stringify( pdata, null, 4));

      var projectName = pdata.name;

      var slugProjectName = pdata.slugProjectName;
      var slugFolderName = pdata.slugFolderName;
      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);

      var currentDateString = dodocAPI.getCurrentDate();

/*
      if( pdata.imageData !== undefined) {
        addProjectPreview(projectPath, pdata.imageData);
      }
*/

      // récupérer les infos sur le project
      var currentpdata = getProjectMeta( slugFolderName, slugProjectName);

      // éditer le JSON récupéré
      currentpdata.name = pdata.name;
      if( pdata.statut !== undefined)
        currentpdata.statut = pdata.statut;
      currentpdata.modified = currentDateString;

      dodocAPI.storeData( getMetaFileOfProject( slugFolderName, slugProjectName), currentpdata, 'update').then(function( meta) {
        var updatedpmeta = getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;

        addProjectPreview(projectPath, pdata.imageData)
        .then(err => {
          updatedpmeta.projectPreviewName = getProjectPreview(projectPath);
          resolve( updatedpmeta);
        });

      }, function() {
        dev.error('--> Couldn\'t update project meta.');
        reject( 'Couldn\'t update project meta');
      });
    });
  }

  function getProjectPreview(projectPath) {
    dev.logverbose( "COMMON — detecting preview for project path : " + projectPath);
    // looking for an image whose name starts with apercu or preview in the project folder
    var filesInProjectFolder = fs.readdirSync( projectPath);
    var previewName = false;
    dev.logverbose( "- match apercu/preview in array : " + filesInProjectFolder);
    filesInProjectFolder.forEach( function( filename) {
      if( new RegExp( dodoc.settings().regexpMatchProjectPreviewNames, 'i').test(filename)) {
        previewName = filename;
        dev.logverbose( "- - match preview called " + previewName);
      }
    });
    dev.logverbose( "- final filename ? " + previewName);
    return previewName;
  }

  function listOneProject(slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - listOneProject slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
      var pdata = getProjectMeta( slugFolderName, slugProjectName);
      pdata.slugFolderName = slugFolderName;
      pdata.slugProjectName = slugProjectName;
      pdata.projectPreviewName = getProjectPreview( projectPath);
      resolve(pdata);
    });
  }
  function removeOneProject( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - onRemoveProject _ slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);

      var projectPath = dodocAPI.getProjectPath(slugFolderName, slugProjectName);
      var deletedProjectName = dodoc.settings().deletedPrefix + slugProjectName;
      deletedProjectName = dodocAPI.findFirstFilenameNotTaken(deletedProjectName, dodocAPI.getFolderPath(slugFolderName), '');
      var deletedProjectPath = dodocAPI.getProjectPath(slugFolderName, deletedProjectName);

      fs.rename( projectPath, deletedProjectPath, function(err) {
        if (err) reject(err);
        var pdata = {
          "slugFolderName" : slugFolderName,
          "slugProjectName" : slugProjectName,
        }
        resolve( pdata);
      });
    });
  }

  /***************************************************************************************************/
  /******************************************** private functions ************************************/
  /***************************************************************************************************/

  function addProjectPreview(projectPath, imageData){
    return new Promise(function(resolve, reject) {
      dev.logfunction(`COMMON - addProjectPreview with projectPath = ${projectPath}`);

      if(imageData === undefined)
        resolve();

      var pathToFile = projectPath + "/" + "apercu";
      var imageBuffer = dodocAPI.decodeBase64Image(imageData);

      dodocAPI.makeImageFromData(imageBuffer.data, pathToFile)
      .then(() => {
        resolve();
      })
      .catch(err => {
        dev.error(`Failed creating thumb for project at path ${projectPath}: ${err}`);
        reject();
      });
    });
  }

  return API;
})();

module.exports = dodocProject;