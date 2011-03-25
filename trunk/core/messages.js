(function($) {

  var count = 0;

  $.fn.merror = function(msg){
    $(this).append('<div class="ui-widget" id="merror'+count+'">\
                   <div class="ui-state-error ui-corner-all" style="margin-top: 5px; margin-bottom: 5px; padding: 0 .7em;"> \
                   <p><span class="ui-icon ui-icon-alert" style="float: left; margin-right: .3em;"></span> \
                   <strong>Alert! </strong>'+msg+'</p></div></div>')
    //console.log($(".merror"+count));
    $("#merror"+count).delay(5000).fadeOut(2000).delay(100).queue(function() {
      $(this).remove();
    });
    count += 1;
  }

  $.fn.minfo = function(msg){
    $(this).append('<div class="ui-widget" id="minfo'+count+'">\
                   <div class="ui-state-highlight ui-corner-all" style="margin-top: 5px; margin-bottom: 5px; padding: 0 .7em;"> \
                   <p><span class="ui-icon ui-icon-info" style="float: left; margin-right: .3em;"></span>\
                   <strong>Info! </strong>'+msg+'</p></div></div>');
    $("#minfo"+count).delay(5000).fadeOut(2000).delay(100).queue(function() {
      $(this).remove();
    });
    count += 1;
  }


})(jQuery);
