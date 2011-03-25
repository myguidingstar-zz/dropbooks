(function($) {

  var fs_persistent;
  var uploadDir = "/tmp/";

  $.fs_init = function(successCallback){

    // Проверяем поддержку File API
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Работает
      //alert('File API поддерживается данным браузером');
    } else {
      alert('File API не поддерживается данным браузером');
    }

    window.requestFileSystem(window.PERSISTENT, 1024*1024, function(fs) {
      fs_persistent = fs;

      $.fs_rmpath("/tmp/",function(){
        $.fs_mkdir(uploadDir, successCallback);
      });

    }, errorHandler);
  }

  //копирует указанный файл в песочницу приложения в /tmp
  $.fs_uploadfile = function(files, successCallback){
    for (var i = 0, file; file = files[i]; ++i) {

      if (file.name.indexOf(".fb2")==-1){
        console.log(file);
        continue;
      }

      (function(f) {
        fs_persistent.root.getFile(uploadDir+file.name, {create: true, exclusive: true}, function(fileEntry) {
          fileEntry.createWriter(function(fileWriter) {

            function done(evt) {
              console.log("Upload file completed:", fileEntry.fullPath);
              successCallback(f,fileEntry,evt);
            }

            function error(evt) {
              console.log("Upload file failed:", fileWriter);
            }

            fileWriter.onwrite = done;
            fileWriter.onerror = error;
            fileWriter.write(f); // Note: write() can take a File or Blob object.

          }, errorHandler);
        }, errorHandler);
      })(file);
    }
  }

  $.fs_mkdir = function(dirName,successCallback){
    fs_persistent.root.getDirectory(dirName, {create: true}, function(dirEntry) {
      successCallback();
    }, errorHandler);
  }

  $.fs_mkpath = function(path,successCallback){
    createDir(fs_persistent.root, path.split('/'),successCallback); // fs.root is a DirectoryEntry.
  }

  function createDir(rootDirEntry, folders,successCallback) {
    //Фильтруем './' и '/'
    if (folders[0] == '.' || folders[0] == '') {
      folders = folders.slice(1);
    }
    rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
      if (folders.length) {
        createDir(dirEntry, folders.slice(1),successCallback);
      }else{
        successCallback();
      }
    }, errorHandler);
  };

  $.fs_rmdir = function(path,successCallback){
    fs_persistent.root.getDirectory(path, {}, function(dirEntry) {

      dirEntry.remove(function() {
        console.log('Directory removed:', path);
        successCallback();
      }, errorHandler);

    }, errorHandler);
  }

  $.fs_rmpath = function(path,successCallback){
    fs_persistent.root.getDirectory(path, {}, function(dirEntry) {

      dirEntry.removeRecursively(function() {
        console.log('Directory removed:', path);
        successCallback()
      }, errorHandler);

    }, function(e){
      switch (e.code) {
        case FileError.NOT_FOUND_ERR:
          successCallback();
          //errorHandler(e);
          break;
        default:
          errorHandler(e);
          break;
      };
    });
  }

  $.fs_listFiles = function(path, successCallback){

    fs_persistent.root.getDirectory(path, {}, function(dirEntry) {
      var dirReader = dirEntry.createReader();
      var entries = [];

      var readEntries = function() {
        dirReader.readEntries (function(results) {
          if (!results.length) {
            successCallback(entries.sort());
          } else {
            entries = entries.concat(toArray(results));
            readEntries();
          }
        }, errorHandler);
      };

      readEntries();

    }, errorHandler);
  }

  $.fs_readFile = function (fileName, successCallback) {
    fs_persistent.root.getFile(fileName, {}, function(fileEntry) {

      fileEntry.file(function(file) {
        var reader = new FileReader();

        // If we use onloadstart, we need to check the readyState.
        reader.onloadstart = function(e) {
          //console.log("Start:", e);
        };

        reader.onprogress = function(e) {
          //console.log("Progress:", e);
        };

        reader.onload = function(e) {
          //console.log("On Load:", e);
        };

        reader.onabort = function(e) {
          console.log("Abort:", e);
        };

        reader.onerror = function(e) {
          console.log("Error:", e);
        };

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(e) {
          //console.log("Loaded:", e);
          if (e.target.readyState == FileReader.DONE) { // DONE == 2
            successCallback(e.target, fileName);
          }
        };

        reader.readAsText(file);
      }, errorHandler);

    }, errorHandler);

  }

  $.fs_writeFile = function (fileName, data, successCallback) {

    fs_persistent.root.getFile(fileName, {create: true}, function(fileEntry) {
      //console.log('blea');

      fileEntry.createWriter(function(fileWriter) {

        function done(evt) {
          console.log('Truncate completed:  ',fileEntry.fullPath);

          fileEntry.createWriter(function(fw) {

            function doneW(evt) {
              console.log('Write completed:  ',fileEntry.fullPath);
              //console.log(successCallback);
              successCallback();
            }

            function errorW(evt) {
              console.log('Write failed:  ' + e.toString());
            }

            fw.onwrite = doneW;
            fw.onerror = errorW;
            var bb = new BlobBuilder();
            bb.append(data);
            fw.write(bb.getBlob('text/plain'));

          }, errorHandler);

//successCallback(f,fileEntry,evt);
        }

        function error(evt) {
          console.log('Truncate failed:  ' + e.toString());
        }

        fileWriter.onwrite = done;
        fileWriter.onerror = error;
        fileWriter.truncate();

      }, errorHandler);

    }, errorHandler);
  }

  $.fs_removeFile = function(fileName, successCallback){
    fs_persistent.root.getFile(fileName, {create: false}, function(fileEntry) {

      fileEntry.remove(function() {
        console.log('File removed:', fileEntry.fullPath);
        successCallback();
      }, errorHandler);
    }, errorHandler);
  }

  $.fs_moveFile = function (src, dirName, successCallback) {
    fs_persistent.root.getFile(src, {}, function(fileEntry) {

      fs_persistent.root.getDirectory(dirName, {}, function(dirEntry) {
        fileEntry.moveTo(dirEntry);
        console.log('Move completed:   ', src, "to", dirEntry.fullPath);
        successCallback();
      }, errorHandler);

    }, errorHandler);
  }

  function toArray(list) {
    return Array.prototype.slice.call(list || [], 0);
  }

  function errorHandler(e) {
    var msg = '';

    //console.log(e);

    switch (e.code) {
      case FileError.QUOTA_EXCEEDED_ERR:
        msg = 'QUOTA_EXCEEDED_ERR';
        break;
      case FileError.NOT_FOUND_ERR:
        msg = 'NOT_FOUND_ERR';
        break;
      case FileError.SECURITY_ERR:
        msg = 'SECURITY_ERR';
        break;
      case FileError.INVALID_MODIFICATION_ERR:
        msg = 'INVALID_MODIFICATION_ERR';
        break;
      case FileError.INVALID_STATE_ERR:
        msg = 'INVALID_STATE_ERR';
        break;
      default:
        msg = 'Unknown Error';
        break;
    };
    $(systopmessages).merror(msg);
    console.log('Error: ' + msg);
  }

})(jQuery);
