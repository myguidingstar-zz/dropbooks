$(document).ready(function () {
  /*$.ajax({
   t yp*e: "GET",
   //url: "example.fb2",
   //url: "Gorpozhaks_Dzhin_Grin_-_Neprikasaemyiy.74169.fb2",
   url: "Lavkraft_Zov_Ktulhu.124972.fb2",
   dataType: "xml",
   success: fb2Parser
  });*/
  
  //console.log(window);
  
  $.fs_init(function(){
    //$.fs_rmpath("/books/",function(){
      $.fs_listFiles("/tmp/",function(entries){
        //console.log(entries);
        $.ll_init(function(){
          $("#bookslist").ll_listBooks();
        });
      });
    //});
  });
  
  
  $("#uploadbook").change(function(){
    $.ll_uploadbook(this.files);
    //$.fs_uploadfile(this.files);
  });
  
  //$.fs_listFiles(listResults);
  
  //$("#bookslist").ll_listBooks();
  
  });
  
  /*
   f un*ction fb2Parser(fb2book) {
     var book = $(fb2book).fb2();
     $("#main").append(book.body);
   }*/