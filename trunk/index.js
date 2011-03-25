$(document).ready(function () {

var $maintabs;

$(function() {
		var $maintabs = $( "#maintabs" ).tabs();
		//console.log("asd");


  $.fs_init(function(){
    $.fs_rmpath("/books/",function(){
      $.fs_listFiles("/tmp/",function(entries){
        //console.log(entries);
        $.ll_init(function(){
          $("#librarybookslist").ll_listBooks();
        });
      });
    });
  });
  
  $("#uploadbook").change(function(){
    $.ll_uploadbook(this.files, function(){
		$maintabs.tabs('select', 0); // switch to third tab
		$("tab_library").click();
	});

  });
  
  });

  });
