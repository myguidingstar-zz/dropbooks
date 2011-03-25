(function($) {
  var description = new Object();
  var body = "";
  var source;
  var contents = new Object();

  var parsed = new Object();
  var elementCount = 0;

  $.fn.fb2 = function(){
    source = this;

    delete description;
    delete body;
    delete contents;
    delete parsed;

    description = new Object();
    body = "";
    contents = new Object();
    parsed = new Object();

    var fb = $(source).find("FictionBook");
    //console.log(fb);

    parseStyles()
    parseDescription();
    parseBody();

    //console.log(description);
    //$("#main").append(body);

    parsed.desc = description;
    parsed.body = body;
    parsed.contents = contents;
    return parsed;
  };

  function parseStyles(){
    console.log("Parse styles");

    $(source).find("stylesheet").each(function () {
      description.styles = "<style type='text/css'>" + $(this).text() + "</style>";
    });
  }

  function parseDescription(){

    console.log("Parse description");

    $(source).find("description").each(function () {

      //console.log("Parse titleinfo");

      var titleinfo = $(this).find("title-info");
      description.titleinfo = new Object();
      description.titleinfo.genres = [];
      $(titleinfo).find("genre").each(function () {
        description.titleinfo.genres.push($(this).text());

      });

      description.titleinfo.author = new Object();
      description.titleinfo.author.firstname = $(titleinfo).find("author").find("first-name").text();
      description.titleinfo.author.middlename = $(titleinfo).find("author").find("middle-name").text();
      description.titleinfo.author.lastname = $(titleinfo).find("author").find("last-name").text();

      description.titleinfo.booktitle = $(titleinfo).find("book-title").text();

      description.titleinfo.annotation = annotationHtml($(titleinfo).find("annotation"));

      description.titleinfo.keywords = $.map($(titleinfo).find("keywords").text().split(","), $.trim);
      description.titleinfo.date = {value:$(titleinfo).find("date").attr("value"), date:$(titleinfo).find("date").text()}

      var href = "";
      $.each($(titleinfo).find("coverpage").children("image").listAttributes(), function(index, value){
        if (value.indexOf("href") > -1){
          href = value;
        }
      });

      description.titleinfo.coverpage = $(titleinfo).find("coverpage").children("image").attr(href).substr(1);

      description.titleinfo.lang = $(titleinfo).find("lang").text();
      description.titleinfo.srclang = $(titleinfo).find("src-lang").text();
      description.titleinfo.translator = new Object();
      description.titleinfo.translator.firstname = $(titleinfo).find("translator").find("first-name").text();
      description.titleinfo.translator.middlename = $(titleinfo).find("translator").find("middle-name").text();
      description.titleinfo.translator.lastname = $(titleinfo).find("translator").find("last-name").text();

      description.titleinfo.sequence = {name:$(titleinfo).find("sequence").attr("name"), number:$(titleinfo).find("sequence").attr("number")}

      var documentinfo = $(this).find("document-info");
      description.documentinfo = new Object();
      description.documentinfo.author = new Object();
      description.documentinfo.author.firstname = $(documentinfo).find("author").find("first-name").text();
      description.documentinfo.author.middlename = $(documentinfo).find("author").find("middle-name").text();
      description.documentinfo.author.lastname = $(documentinfo).find("author").find("last-name").text();

      description.documentinfo.programused = $(documentinfo).find("program-used").text();;
      description.documentinfo.date = {value:$(documentinfo).find("date").attr("value"), date:$(documentinfo).find("date").text()}
      description.documentinfo.srcurl = $(documentinfo).find("src-url").text();
      description.documentinfo.srcocr = $(documentinfo).find("src-ocr").text();
      description.documentinfo.id = $(documentinfo).find("id").text();
      description.documentinfo.version = $(documentinfo).find("version").text();
      description.documentinfo.history = $(documentinfo).find("history").children("p").text();

      var publishinfo = $(this).find("publish-info");
      description.publishinfo = new Object();
      description.publishinfo.bookname = $(publishinfo).find("book-name").text();;
      description.publishinfo.publisher = $(publishinfo).find("publisher").text();;
      description.publishinfo.city = $(publishinfo).find("city").text();;
      description.publishinfo.year = $(publishinfo).find("year").text();;
      description.publishinfo.isbn = $(publishinfo).find("isbn").text();;

      var custominfo = $(this).find("custom-info");
      description.custominfo = $(custominfo).text();

    });
  };

  function annotationHtml(src){
    var html = "";
    src.children().each(function(){
      //console.log((this).tagName);
      switch ((this).tagName) {
      case 'p':
          html += "<p>" + $(this).text() + "</p>";
        break;
      case 'poem':{
          html += "<p class='poem'>";
          $(this).children().each(function(){
            switch ((this).tagName) {
            case 'title':
                html += "<h1 class='poem-title'>" + $(this).text() + "</h1>";
              break;
            case 'epigraph':
                html += "<span class='poem-epigraph'>" + $(this).text() + "</span><br/>";
              break;
            case 'stanza':
                html += "<span class='poem-stanza'>";
              $(this).children("v").each(function(){
                html += $(this).text() + "<br/>";
              });
              html += "</span><br/>";
              break;
            case 'empty-line':
                html += "<br/>";
              break;
            }
          });

          html += "</p>";
        }
        break;
      case 'cite':
          html += "<p class='cite'>" + $(this).children("p").text() + "<p class='cite-author'>" +
                  $(this).children("text-author").text() + "</p></p>";
        break;
      case 'empty-line':
          html += "<br/>";
        break;
      }
    });
    return html;
  };

  function parseBody(){

    console.log("Parse body");

    $(source).find("body").each(function () {
      if ( $(this).attr("name") != "notes" ) {
        body += "<div class='book-body'><div class='bookimage'><img class='cover-illustration' id=" + description.titleinfo.coverpage +" src='data:image/gif;base64," + getBinary(description.titleinfo.coverpage) + "' /></div>";
        body +=sectionHtml($(this), 0, false);
      }else{
        body +=sectionHtml($(this), 0, true);
      }
      body += "</div>";
    });
  };

  function sectionHtml(src,_level, isNotes){
    var html = "";
    var level = _level+2;
    if (level>6){
      level = 6;
    }
    elementCount += 1;
    //console.log(src)
    $(src).children().each(function () {
      elementCount += 1;
      switch ((this).tagName) {
      case 'image':

          var href = "";
        $.each($(this).listAttributes(), function(index, value){
          if (value.indexOf("href") > -1){
            href = value;
          }
        });

        var id = $(this).attr(href).substr(1);
        html += "<div id='section"+elementCount+"' class='bookimage'><img class='section-illustration' id="+ id +" src='data:image/gif;base64," + getBinary(id) + "' /></div>";
        break;
      case 'title':
          if (isNotes && _level>0){
          $(this).children("p").each(function(){
            html += "<a id='"+$(src).attr("id")+"'><h"+level+" class='section-title'>" + $(this).text() + "</h"+level + "></a>";
          });

        }else{
          $(this).children("p").each(function(){
            html += "<h"+level+" id='section"+elementCount+"' class='section-title'>" + $(this).text() + "</h"+level + ">";
          });
        }
        break;
      case 'epigraph': {

          $(this).children().each(function(){
            switch ((this).tagName) {
            case 'p':
                html += "<p id='section"+elementCount+"' class='section-epigraph'>" + $(this).text() + "</p>";
              break;
            case 'text-author':
                html += "<p id='section"+elementCount+"' class='section-epigraph-author'>" + $(this).text() + "</p><br/>";
              break;
            case 'empty-line':
                html += "<br/>";
              break;
            }
          });
          break;
        }
      case 'section':
          html += sectionHtml($(this), _level+1,isNotes);
        break;
      case 'p':
          if ($(this).children("a").size()>0){

          $(this).children("a").each(function(){
            elementCount += 1;
            var href = "";
            $.each($(this).listAttributes(), function(index, value){
              if (value.indexOf("href") > -1){
                href = value;
              }
            });

            $(this).text(" [<a id='section"+elementCount+"' href='"+$(this).attr(href)+"'>" + $(this).text() + "</a>]");
          });

          html += "<p id='section"+elementCount+"' class='body-paragpraph'>" + $(this).text() + "</p>";
        }else{
          html += "<p id='section"+elementCount+"' >" + $(this).text() + "</p>";
        }
        break;
      case 'poem':{
          html += "<p id='section"+elementCount+"' class='poem'>";
          $(this).children().each(function(){
            elementCount += 1;
            switch ((this).tagName) {
            case 'title':
                html += "<h1 id='section"+elementCount+"' class='poem-title'>" + $(this).text() + "</h1>";
              break;
            case 'epigraph':
                html += "<span id='section"+elementCount+"' class='poem-epigraph'>" + $(this).text() + "</span><br/>";
              break;
            case 'stanza':
                html += "<span id='section"+elementCount+"' class='poem-stanza'>";
              $(this).children("v").each(function(){
                html += $(this).text() + "<br/>";
              });
              html += "</span><br/>";
              break;
            case 'empty-line':
                html += "<br/>";
              break;
            }
          });

          html += "</p>";
        }
        break;
      }
    });
    return html;
  }

  function getBinary(binaryId){
    var image = "";
    $(source).find("binary").each(function () {
      if ($(this).attr('id')==binaryId) {
        image = $(this).text();
        //break;
      }
    });

    return image;
  };

})(jQuery);
