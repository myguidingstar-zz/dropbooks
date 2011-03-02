(function($) {

  var selector = "";
  var aDataSet = [];
  var oTable;

  /* { title:[name, author, Size, fullPath], syncstatus, ... ], ... } */;
  var library = new Object();

  var libraryDirectory = "/books/";
  var libraryConfigName = libraryDirectory+"library.json";
  var bookMetaFileName = "meta.json";
  var bookDescFileName = "description.json";

  $.ll_init = function(successCallback){

    $.fs_listFiles("/",function(entries) {

      var exists = false;

      $(entries).each(function(entry, i){
        //console.log(i.isDirectory, i.name);
        if ((i.isDirectory) && (i.name == "books")){
          exists = true;
        }
      });

      if (exists){
        console.log("Library founded! Loading...");

        $.fs_readFile(libraryConfigName, function(file){
          console.log(file.result);
          library = JSON.parse(file.result);
          successCallback();
        });
      }else{
        console.log("none library! =( Start creation...");
        $.fs_mkpath(libraryDirectory, function() {
          $.fs_writeFile(libraryConfigName, JSON.stringify(library), function(){
            successCallback();
          });
        });

      }

      //console.log(exists);
    });

  }

  $.ll_uploadbook = function(files){
    $.fs_uploadfile(files, function(file, fileEntry, evt){
      //$.fs_listFiles("/tmp/",listBooks);

      //console.log(file, fileEntry);

      $.fs_readFile(fileEntry.fullPath, function(fileReader, fileName){

        var content = fileReader.result;
        //console.log(content);

        var dom = $.xmlDOM(content, function(error) {
          //console.error('A parse error occurred! ' + error);
          $.fs_removeFile(fileName, function(){
            console.error('A parse error occurred! File: ', fileName);
          });
        });
        
        console.log(dom);
        
        var book = $(dom).fb2();
        
        //console.log(book);

        var bookPath = libraryDirectory + book.desc.titleinfo.author.lastname + " " + book.desc.titleinfo.author.firstname + "/" + book.desc.titleinfo.booktitle + "/";

        $.fs_rmpath(bookPath, function(){
          //console.log("df");

          $.fs_mkpath(bookPath, function(){
            $.fs_moveFile(fileName, bookPath, function(){

              $.fs_writeFile(bookPath + bookDescFileName, JSON.stringify(book.desc), function(){

                //console.log(book.body);
                $.fs_writeFile(bookPath + "body.html", book.body, function(){

                  var info = [book.desc.titleinfo.booktitle, book.desc.titleinfo.author.lastname + " " + book.desc.titleinfo.author.firstname, file.fileSize, bookPath];

                  library[book.desc.titleinfo.author.lastname + " " + book.desc.titleinfo.author.firstname + " - " + book.desc.titleinfo.booktitle] = info;

                  $.fs_writeFile(libraryConfigName, JSON.stringify(library), function(){
                    $.fn.ll_listBooks();
                  });
                });
              });
            });
          });
        });

      });
    });
  }

  $.fn.ll_listBooks = function(){
    selector = (this).attr("id");
    $.fs_listFiles("/tmp/",listBooks);
  }

  function listBooks (entries) {
    aDataSet = [];

    for (book in library)
    {
      if (library[book].constructor == Array){
        var elem = [];
        $(library[book]).each(function(entry, i){
          //console.log(entry, i);
          elem.push(i);
        });
        elem.push("<a href='' class='removeBook' name='"+elem[1] + " - " + elem[0] +
                  "' onClick=' '>Remove</a>");
        aDataSet.push(elem);
      }
    }

    if (oTable != undefined){
      oTable.fnClearTable();
      oTable.fnAddData(aDataSet);

      oTable.fnDraw();
    }else{
      $("#"+selector).html( '<table cellpadding="0" cellspacing="0" border="0" class="display" id="ll_bookslist"></table>' );
      oTable = $('#ll_bookslist').dataTable( {
        "aaData": aDataSet,
        "aoColumns": [
          { "sTitle": "Title" },
          { "sTitle": "Author" },
          { "sTitle": "Size" },
          { "sTitle": "Path" },
          { "sTitle": "Actions" },
        ]
      } );
    }

    $('.removeBook').click(function(){
      //console.log("asd");
      removeBook($(this).attr("name"));
      return false;
    });
  }

  function removeBook(fullName){

    var fullPath = library[fullName][3];

    $.fs_rmpath(fullPath, function(){
      delete library[fullName];
      $.fs_writeFile(libraryConfigName, JSON.stringify(library), function(){
        console.log(library);
        console.log("Book removed:", fullName);

        $.fs_readFile(libraryConfigName, function(file){
          console.log(file.result);
          library = JSON.parse(file.result);
          //successCallback();
        });

        $.fn.ll_listBooks();
      });
    });


  }



})(jQuery);
