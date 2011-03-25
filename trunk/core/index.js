$(document).ready(function () {

var maintabs;
var systopmessages = $("div#systopmessages");
var sysbottommessages = $("div#sysbottommessages");
var bookbody = $("div#bookbody");

$(function() {
    //UI
    var $maintabs = $( "#maintabs" ).tabs();

    var progressbar = $( "#progressbar" ).progressbar({value: 0});
    progressbar.hide();

  $.fs_init(function(){
    //$.fs_rmpath("/books/",function(){
      $.fs_listFiles("/tmp/",function(entries){
        //console.log(entries);
        $.ll_init(function(){
          $("#librarybookslist").ll_listBooks();
        });
      });
    //});
  });

  $("#uploadbook").change(function(){
    var uploadbook = this;
    progressbar.progressbar({value: 0});
    progressbar.show();
    $(uploadbook).hide();
    $.ll_uploadbook(this.files, progressbar, function(){
        $maintabs.tabs('select', 0); // switch to third tab
        $(sysbottommessages).minfo("Book added: " + $(uploadbook).val());
        progressbar.hide();
        $(uploadbook).show();
        $(uploadbook).val("");
    });
  });

  });

  });
