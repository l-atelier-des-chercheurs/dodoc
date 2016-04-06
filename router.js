var _ = require("underscore");
var url = require('url')
var fs = require('fs-extra');
var path = require("path");
var fs = require('fs-extra');
var ffmpeg = require('fluent-ffmpeg');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var dodoc  = require('./dodoc');

module.exports = function(app,io,m){


  /**
  * routing event
  */
  app.get("/", getIndex);
  app.get("/:folder", getFolder);
  app.get("/:folder/:project", getProject);
  app.get("/:folder/:project/capture", getCapture);
  app.get("/:folder/:project/bibliotheque/medias", getBibli);
  app.get("/:folder/:project/bibliotheque/panneau-de-publications", getBibliPubli);
  app.get("/:folder/:project/publication/:publi", getPubli);

  app.post("/:folder/:project/bibliotheque/medias/file-upload", multipartMiddleware, postFile);


  /**
  * routing functions
  */
  function getFullPath( path) {
    return dodoc.contentDir + "/" + path;
  }

  function getJsonFileOfFolder( slugFolderName) {
    return getFullPath( slugFolderName) + '/' + dodoc.folderJSONfilename;
  }

  function getProjectPath( slugFolderName, slugProjectName) {
    return slugFolderName + '/' + slugProjectName;
  }
  function getJsonFileOfProject( projectPath) {
    return getFullPath( projectPath) + '/' + dodoc.projectJSONfilename;
  }

  function getPubliPath( slugFolderName, slugProjectName, slugPubliName) {
    return slugFolderName + '/' + slugProjectName + '/montage/' + slugPubliName;
  }
  function getJsonFileOfPubli( publiPath) {
    return getFullPath( publiPath) + '/' + dodoc.publiJSONfilename;
  }


  function generatePageData( req, pageTitle) {

    var pageDataJSON = [];

    var slugFolderName = req.param('folder');

    if( slugFolderName !== undefined) {
      var jsonFileOfFolder = getJsonFileOfFolder( slugFolderName);
      var folderData = readJsonFile( jsonFileOfFolder);

      pageDataJSON.folder = slugFolderName;
      pageDataJSON.folderName = folderData.name;
      pageDataJSON.statut = folderData.statut;

      var slugProjectName = req.param('project');
      if( slugProjectName !== undefined) {
        var projectPath = getProjectPath( slugFolderName, slugProjectName)
        var jsonFileOfProject = getJsonFileOfProject( projectPath);
        var projectData = readJsonFile( jsonFileOfProject);

        pageDataJSON.project = slugProjectName;
        pageDataJSON.projectName = projectData.name;

        var slugPubliName = req.param('publi');
        if( slugPubliName !== undefined) {
          var publiPath = getPubliPath( slugFolderName, slugProjectName, slugPubliName);
          var jsonFileOfPubli = getJsonFileOfPubli( publiPath);
          var publiData = readJsonFile( jsonFileOfPubli);

          pageDataJSON.publi = publiData.publi;
          pageDataJSON.publiName = publiData.name;
        }
      }
    }

    if( publiData !== undefined)
      pageTitle += " | " + publiData.name;
    else if( projectData !== undefined)
      pageTitle += " | " + projectData.name;
    else if( folderData !== undefined)
      pageTitle += " | " + folderData.name;

    pageDataJSON.pageTitle = pageTitle;
    pageDataJSON.url = req.path;

    return pageDataJSON;

  }


  // GET
  function getIndex(req, res) {
    var pageTitle = "Do.Doc";
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("index", generatePageDataJSON);
  };

  function getFolder(req, res) {
    var pageTitle = dodoc.nameOfFolder;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("folder", generatePageDataJSON);
  };

  function getProject(req, res) {
    var pageTitle = dodoc.nameOfProject;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getCapture(req, res) {
    var pageTitle = dodoc.nameOfCapture;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getBibli(req, res) {
    var pageTitle = dodoc.nameOfBibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getBibliPubli(req, res) {
    var pageTitle = dodoc.nameOfBibli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function getPubli(req, res) {
    var pageTitle = dodoc.nameOfPubli;
    var generatePageDataJSON = generatePageData(req, pageTitle);
    res.render("project", generatePageDataJSON);
  };

  function postFile(req, res) {
    var date = Date.now();
    var ext = path.extname(req.files.file.name);
    var session = req.param('session');
    var projet = req.param('project');
    var dir =  'sessions/'+ session + '/' + projet;
    fs.readFile(req.files.file.path, function (err, data) {
      var newPath = 'sessions/'+ session + '/' + projet + '/' + date + ext;
      if(ext == ".webm" || ext == ".ogg" || ext == ".mov" || ext == ".mp4"){
        createThumnails(newPath, date, dir)
      }
      fs.writeFile(newPath, data, function (err) {
        res.redirect("back");
        io.sockets.emit("newMediaUpload", {path: newPath, fileName: date+ext, ext:ext, id: date});
      });
    });
  };


  function readJsonFile( jsonFile){
    var jsonFileContent = fs.readFileSync(jsonFile, 'utf8');
    var jsonFileContentParsed = JSON.parse( jsonFileContent);
    return jsonFileContentParsed;
  }

  function createThumnails(path, fileName, dir){
    var proc = ffmpeg(path)
    // setup event handlers
    .on('end', function(files) {
      console.log('screenshots were saved as ' + fileName + "-thumb.png");
    })
    .on('error', function(err) {
      console.log('an error happened: ' + err.message);
    })
    // take 2 screenshots at predefined timemarks
    .takeScreenshots({ count: 1, timemarks: [ '00:00:01'], filename: fileName + "-thumb.png"}, dir);
  }





};
