console.log("app is up")

// Following handles the button clicking and enabling/disabling the tab-pane

$(document).ready(function() {

	console.log("document is ready")

	// change temp display state and render weather if user clicks
	$('#button1').on('click', function(event) {
	  event.preventDefault(); // prevents page scrolling upon click          
      console.log("button1 clicked")
      // remove my-active from all associated my-tab-panes
      // this is a make it work method, but not extensible
      // if the my-tab-pane is to be used for other panes.
      // Since there is no need, we can simply use this.
      $('.my-tab-pane').removeClass('my-active')

      // add my-active to the associated my-tab-pane
      $('#tab-button1').addClass('my-active')

	}); 

	$('#button2').on('click', function(event) {
	  event.preventDefault(); // prevents page scrolling upon click          
      console.log("button2 clicked")
      // remove my-active from all associated my-tab-panes
      // this is a make it work method, but not extensible
      // if the my-tab-pane is to be used for other panes.
      // Since there is no need, we can simply use this.
      $('.my-tab-pane').removeClass('my-active')

      // add my-active to the associated my-tab-pane
      $('#tab-button2').addClass('my-active')

	}); 


	$('#button3').on('click', function(event) {
	  event.preventDefault(); // prevents page scrolling upon click          
      console.log("button3 clicked")
      // remove my-active from all associated my-tab-panes
      // this is a make it work method, but not extensible
      // if the my-tab-pane is to be used for other panes.
      // Since there is no need, we can simply use this.
      $('.my-tab-pane').removeClass('my-active')

      // add my-active to the associated my-tab-pane
      $('#tab-button3').addClass('my-active')

	}); 	

}) // document ready


///////////////////////////////////////////////////////////////////////////////////
//
// This is my second draft of this project.
// This project uses Twitter bootstrap and jQuery's getJSON().
// The program is separated into 3 modules: View, User (ie. model), and UserController.
// This implementation uses a simple callback counting mechanism in order to determine
// when the last getJSON callback has completed.
// Future enhancements to this program can be using higher level functions
// inconjunction with getJSON, ie. when, then, and async.
// Another could be re-implementing the project using Angular .

/////////////////////////////////////////////////////////////////////////////////////
// View implementation
var View = (function () {
  
  userTemplate = function(obj) {

    var url = obj.url;
    var img_url = obj.img_url;
    var name = obj.name;
    var status = obj.status;
    var disabled = "";
    if (obj.is_online === false) {
      disabled = "disabled";
      status  = "";
    }
    if (img_url === "" || img_url === null) 
      img_url = "http://isigned.org/images/anonymous.png"
    var template = "";
    template += "<li>"
    template += "<a href='"+url+"' class='list-group-item "+disabled+"'>"
    template += "    <img class='pull-left img-circle'"
    template += "      src='"+img_url+"' alt='...' width='45'>"
    template += "      <h4 class='text-center'>"+name+" <small>"+status+"</small></h4>"
    template += "</a>"
    template += "</li>"
    return template
 }

  
  var userRender = function(objAry, htmlTag) {
    if (objAry.length === 0) $(htmlTag).
      append("<p class='text-center'><strong><br/>Sorry there are no users.<strong></p>");
    else {
      objAry.forEach(function(obj) {
        $(htmlTag).
          append(userTemplate(obj));
       });
    };
  }
  
  clear = function(htmlTag) {
    $(htmlTag).empty();
  }
  
  // View API
  return {    
    userRender: userRender,
    clear: clear
  };
 
})();  


/////////////////////////////////////////////////////////////////////////////////////////
// User Model implementation
var User = (function () {
 
  var twitch_url      = "https://twitch.tv/";
  var default_img_url = "http://isigned.org/images/anonymous.png";
  var stream_api      = "https://api.twitch.tv/kraken/streams/";
  var user_api        = "https://api.twitch.tv/kraken/users/";
  var users = []; // an ary of user objects with name, is_online, url, img_url, and status    
  
  // private function used by sort
  alpha = function(a,b) {
      if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
      if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
      return 0;
  };
  
  // this is the constructor, maybe there is a more javascript way to do this
  init = function(userlist, initViewCallback) {
    userlist.forEach(function(entry) {
      // make assumption that user is offline, has no status, and has no picture
      var obj = {};
      obj.name      = entry;
      obj.url       = twitch_url + entry;
      obj.is_online = false;
      obj.img_url   = default_img_url;
      obj.status    = "";
      users.push(obj);
    });

    // This implementation counts and decrements callbacks.
    // When the last callback returns, the initViewCallback() input will be invoked.
    var outstandingCallbacks = 0;
    users.forEach(function(user, index, array){ 
      outstandingCallbacks += 1;
      $.getJSON( stream_api + user.name + '?callback=?', function( data ) {
        outstandingCallbacks -= 1;
        if (data.stream !== null) {
          user.is_online = true;
          user.status    = data.stream.channel.status; // DRT - this gave an error. Why?
        }
        if (outstandingCallbacks === 0) {
          initViewCallback();
        }            
      });    
      outstandingCallbacks += 1;
      $.getJSON( user_api + user.name + '?callback=?', function( data ) {
        outstandingCallbacks -= 1;
        if (data.logo !== null) user.img_url = data.logo;
        if (outstandingCallbacks === 0) {
          initViewCallback();
        }
      });      
    }); // users.forEach  
     
  };    
      
  all = function() {    
    return find_all_by("is_online",true).concat(find_all_by("is_online",false));    
  };
  
  find_all_by = function(property, value) {
    return users.filter(function(user) {
      return user[property] === value;
    }).sort(alpha);
  };  
  
  // User Model API
  return {    
    init:        init,        
    all:         all,    
    find_all_by: find_all_by
  };
 
})();

//////////////////////////////////////////////////////////////////////////////////////////
// UserController implementation
var UserController = (function () {
    
  $(document).ready(function() {
    User.init(
      ["freecodecamp", "storbeck", "terakilobyte", "medrybw", "habathcx","RobotCaleb","comster404","brunofin","thomasballinger","noobs2ninjas","beohoff","Sing_sing"],
      function() {
        console.log("Inside callback");
        View.userRender(User.all(), "#all-list-group");
        View.userRender(User.find_all_by( "is_online", true ), "#online-list-group");
        View.userRender(User.find_all_by( "is_online", false ), "#offline-list-group");             
      });
   
    
    $('#search_box').on('input', function() {
      var match_string = $('#search_box').val();
      var match = function(e){return e.name.indexOf(match_string) > -1}
      var matched_online_users = User.find_all_by( "is_online", true ).
          filter(match);
      var matched_offline_users = User.find_all_by( "is_online", false ).
          filter(match);
      View.clear( "#all-list-group");
      View.clear( "#online-list-group");
      View.clear( "#offline-list-group");
      View.userRender(matched_online_users.concat(matched_offline_users),
                      "#all-list-group");
      View.userRender(matched_online_users, "#online-list-group");
      View.userRender(matched_offline_users, "#offline-list-group");       
    });  // search_box 
    
  }); // document.ready
    
})(); // UserController  
