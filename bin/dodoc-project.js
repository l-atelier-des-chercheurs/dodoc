var path = require('path');
var fs = require('fs-extra');
var slugg = require('slugg');
var merge = require('merge');

var dodoc  = require('../public/dodoc');
var devLog = require('./dev-log.js');

var dodocAPI = require('./dodoc-api.js');

var dodocProject = module.exports = {

  /********************************************* SHORT FUNCTIONS *********************************************/

  getProjectPath: function( slugFolderName, slugProjectName) {
    var dodocFolder = require('./dodoc-folder.js');
    return path.join( dodocFolder.getFolderPath(slugFolderName), slugProjectName);
  },
  getMetaFileOfProject: function( slugFolderName, slugProjectName) {
    return path.join( dodocProject.getProjectPath( slugFolderName, slugProjectName), dodoc.projectMetafilename + dodoc.metaFileext);
  },

  getProjectMeta: function(slugFolderName, slugProjectName) {
//    dev.log( "getProjectMeta with slugFolderName : " + slugFolderName + " slugProjectName : " + slugProjectName);
    var projectJSONFile = dodocProject.getMetaFileOfProject( slugFolderName, slugProjectName);
    var projectData = fs.readFileSync( projectJSONFile, dodoc.textEncoding);
    var projectJSONdata = dodocAPI.parseData(projectData);

    return projectJSONdata;
  },

  /********************************************* LONG FUNCTIONS *********************************************/
  createNewProject: function( projectData) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — createNewProject");

      var projectName = projectData.projectName;
      var slugProjectName = slugg( projectName);
      var slugFolderName = projectData.slugFolderName;

      var currentDateString = dodocAPI.getCurrentDate();
      var dodocFolder = require('./dodoc-folder.js');
      var pathToFolder = dodocFolder.getFolderPath( slugFolderName);

      // Vérifie si le projet existe déjà, change son slug si besoin
      slugProjectName = dodocAPI.findFirstFilenameNotTaken( slugProjectName, pathToFolder, '');
      var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);

      console.log("New project created with name " + projectName + " and path " + projectPath);
      fs.ensureDirSync(projectPath);//new project

      if( projectData.imageData !== undefined) {
        dodocProject.addProjectImage( "apercu", projectPath, projectData.imageData);
      }

      var dodocMedia = require('./dodoc-media.js');
      var mediaFolders = dodocMedia.getAllMediasFoldersPathAsArray();
      mediaFolders.forEach( function( mediaFolder) {
        fs.ensureDirSync( path.join( projectPath, mediaFolder));//write new medias folder in folders
      });
      var publiFolder = dodocPubli.getPubliPathOfProject();
      fs.ensureDirSync( path.join( projectPath, publiFolder));//write new publi folder in folders

      var pmeta =
        {
          "name" : projectName,
          "created" : currentDateString,
          "modified" : currentDateString,
          "statut" : "en cours",
          "informations" : 0
        };

      dodocAPI.storeData( dodocProject.getMetaFileOfProject( slugFolderName, slugProjectName), pmeta, "create").then(function( meta) {
        var updatedpmeta = dodocProject.getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;
        updatedpmeta.projectPreviewName = dodocProject.getProjectPreview( projectPath);
        resolve( updatedpmeta);
      });
    });
  },

  getProjectPreview: function(projectPath) {
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
  },

  addProjectImage: function(imageNameSlug, parentPath, imageData){
    var filePath = parentPath + "/" + imageNameSlug + ".png";
    var imageBuffer = dodocAPI.decodeBase64Image( imageData);
    fs.writeFileSync(filePath, imageBuffer.data);
    console.info("write new file to " + filePath);
  },

  // accepts a folderData with at least a "foldername", a "slugFolderName", a "projectname" and a "slugProjectName"
  updateProjectMeta: function(pdata) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON — updateProjectMeta : " + JSON.stringify( pdata, null, 4));

      var projectName = pdata.name;

      var slugProjectName = pdata.slugProjectName;
      var slugFolderName = pdata.slugFolderName;
      var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);

      var currentDateString = dodocAPI.getCurrentDate();

      if( pdata.imageData !== undefined) {
        dodocProject.addProjectImage( "apercu", projectPath, pdata.imageData);
      }

      // récupérer les infos sur le project
      var currentpdata = dodocProject.getProjectMeta( slugFolderName, slugProjectName);

      // éditer le JSON récupéré
      currentpdata.name = pdata.name;
      if( pdata.statut !== undefined)
        currentpdata.statut = pdata.statut;
      currentpdata.modified = currentDateString;

      dodocAPI.storeData( dodocProject.getMetaFileOfProject( slugFolderName, slugProjectName), currentpdata, 'update').then(function( meta) {
        var updatedpmeta = dodocProject.getProjectMeta( slugFolderName, slugProjectName);
        updatedpmeta.slugFolderName = slugFolderName;
        updatedpmeta.slugProjectName = slugProjectName;
        updatedpmeta.projectPreviewName = dodocProject.getProjectPreview( projectPath);
        resolve( updatedpmeta);
      }, function() {
        console.log( gutil.colors.red('--> Couldn\'t update project meta.'));
        reject( 'Couldn\'t update project meta');
      });
    });
  },

  listOneProject: function(slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - listOneProject slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);
      var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);
      var pdata = dodocProject.getProjectMeta( slugFolderName, slugProjectName);
      pdata.slugFolderName = slugFolderName;
      pdata.slugProjectName = slugProjectName;
      pdata.projectPreviewName = dodocProject.getProjectPreview( projectPath);
      resolve(pdata);
    });
  },

  removeOneProject: function( slugFolderName, slugProjectName) {
    return new Promise(function(resolve, reject) {
      dev.logfunction( "COMMON - onRemoveProject _ slugFolderName = " + slugFolderName + " slugProjectName = " + slugProjectName);

      var projectPath = dodocProject.getProjectPath( slugFolderName, slugProjectName);
      var projectPathToDeleted = dodocProject.getProjectPath( slugFolderName, dodoc.deletedPrefix + slugProjectName);
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
  },

};
