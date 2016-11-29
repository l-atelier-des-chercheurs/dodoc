var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var dodoc  = require('../dodoc');

var dodocAPI = require('./dodoc-api');
var dodocPubli = require('./dodoc-publi');

var dodocProject = (function() {

  const API = {
    getMetaFileOfProject     : function(slugFolderName, slugProjectName) { return getMetaFileOfProject(slugFolderName, slugProjectName); },
    getProjectMeta           : function(slugFolderName, slugProjectName) { return getProjectMeta(slugFolderName, slugProjectName); },
    createNewProject         : function(projectData) { return createNewProject(projectData); },
    getProjectPreview        : function(projectPath) { return getProjectPreview(projectPath); },
    updateProjectMeta        : function(pdata) { return updateProjectMeta(pdata); },
    listOneProject           : function(slugFolderName, slugProjectName) { return listOneProject(slugFolderName, slugProjectName); },
    removeOneProject         : function(slugFolderName, slugProjectName) { return removeOneProject(slugFolderName, slugProjectName); },
  };

  /***************************************************************************************************/
  /******************************************** public functions *************************************/
  /***************************************************************************************************/

  function getMetaFileOfProject( slugFolderName, slugProjectName) {
    return path.join( dodocAPI.getProjectPath( slugFolderName, slugProjectName), dodoc.projectMetafilename + dodoc.metaFileext);
  }
  function getProjectMeta(slugFolderName, slugProjectName) {
//    dev.log( "getProjectMeta with slugFolderName : " + slugFolderName + " slugProjectName : " + slugProjectName);
    var projectJSONFile = getMetaFileOfProject( slugFolderName, slugProjectName);
    var projectData = fs.readFileSync( projectJSONFile, dodoc.textEncoding);
    var projectJSONdata = dodocAPI.parseData(projectData);

    return projectJSONdata;
  }
  function createNewProject( projectData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewProject");

      var projectName = projectData.projectName;
      var slugProjectName = slugg( projectName);
      var slugFolderName = projectData.slugFolderName;

      var currentDateString = dodocAPI.getCurrentDate();
      var dodocFolder = require('./dodoc-folder.js');
      var pathToFolder = dodocAPI.getFolderPath( slugFolderName);

      // Vérifie si le projet existe déjà, change son slug si besoin
      slugProjectName = dodocAPI.findFirstFilenameNotTaken( slugProjectName, pathToFolder, '');
      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);

      console.log("New project created with name " + projectName + " and path " + projectPath);
      fs.ensureDirSync(projectPath);//new project

      if( projectData.imageData !== undefined) {
        _addProjectPreview( "apercu", projectPath, projectData.imageData);
      }

      var dodocMedia = require('./dodoc-media.js');
      var mediaFolders = dodocMedia.getAllMediasFoldersPathAsArray();
      mediaFolders.forEach( function( mediaFolder) {
        fs.ensureDirSync( path.join( projectPath, mediaFolder));//write new medias folder in folders
      });
      fs.ensureDirSync( path.join(projectPath, dodoc.projectPublisFoldername));//write new publi folder in folders

      var pmeta =
        {
          "name" : projectName,
          "created" : currentDateString,
          "modified" : currentDateString,
          "statut" : "en cours",
          "informations" : 0
        };

      var metaFileOfProject = getMetaFileOfProject( slugFolderName, slugProjectName);

      dodocAPI.storeData(metaFileOfProject, pmeta, "create").then(function( meta) {
        dev.logverbose('Just stored new project data, returning this data to client');
        var updatedpmeta = getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;
        updatedpmeta.projectPreviewName = getProjectPreview( projectPath);
        resolve( updatedpmeta);
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
      if( new RegExp( dodoc.regexpMatchProjectPreviewNames, 'i').test(filename)) {
        previewName = filename;
        dev.logverbose( "- - match preview called " + previewName);
      }
    });
    dev.logverbose( "- final filename ? " + previewName);
    return previewName;
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

      if( pdata.imageData !== undefined) {
        _addProjectPreview( "apercu", projectPath, pdata.imageData);
      }

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
        updatedpmeta.projectPreviewName = getProjectPreview( projectPath);
        resolve( updatedpmeta);
      }, function() {
        dev.error('--> Couldn\'t update project meta.');
        reject( 'Couldn\'t update project meta');
      });
    });
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

      var projectPath = dodocAPI.getProjectPath( slugFolderName, slugProjectName);
      var projectPathToDeleted = dodocAPI.getProjectPath( slugFolderName, dodoc.deletedPrefix + slugProjectName);
      fs.rename( projectPath, projectPathToDeleted, function(err) {
        if (err) reject(err);
        var projectData =
        {
          "slugFolderName" : slugFolderName,
          "slugProjectName" : slugProjectName,
        }
        resolve( projectData);
      });
    });
  }

  /***************************************************************************************************/
  /******************************************** private functions ************************************/
  /***************************************************************************************************/

  function _addProjectPreview(imageNameSlug, parentPath, imageData){
    var filePath = parentPath + "/" + imageNameSlug + ".png";
    var imageBuffer = dodocAPI.decodeBase64Image( imageData);
    fs.writeFileSync(filePath, imageBuffer.data);
    console.info("write new file to " + filePath);
  }






  return API;
})();

module.exports = dodocProject;