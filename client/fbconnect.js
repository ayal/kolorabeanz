window.FBStatus = window.FBStatus || $.Deferred();

Template.fbconnect.connect = function () {
    var _gaq = window._gaq || [];
    var retrySDK = true;
    var FBReady = $.Deferred();
    var FBLoggedIn = $.Deferred();
    window.status = null;
    
    fbfunction = function(wr, wait){
	return function(a){
	    
	    $.when(wait || FBReady)
		.done(function(){
		          wr(a);
		      });
	};
    };

    window.publishVote = function(type){
	var url = location.href;
	var action = 'vote';
	FB.api('/me/' + 'kolorabim' + ':' + action, 'post', 
	       { bill :  url, type: type},
	       function(response){
		   if (!response || response.error) {
		       _gaq.push(['_trackEvent', 'Errors', 'published_' + action + '_action', response.error, 1]);
		   }
		   else {
		       _gaq.push(['_trackEvent', 'Virality', 'published_' + action + '_action', JSON.stringify(response), 1]); 
		   }
	       });
	
    };

 window.publishView = function(type){
	var url = location.href;
	var action = 'review';
	FB.api('/me/' + 'kolorabim' + ':' + action, 'post', 
	       { bill :  url},
	       function(response){
		   if (!response || response.error) {
		       _gaq.push(['_trackEvent', 'Errors', 'published_' + action + '_action', response.error, 1]);
		   }
		   else {
		       _gaq.push(['_trackEvent', 'Virality', 'published_' + action + '_action', JSON.stringify(response), 1]); 
		   }
	       });
	
    };


    var setStatus = function(resp) {
	if (status === resp.status){		
	    return; // there is no need to update
	}
	
	window.status = resp.status;
	Session.set('fbstatus', status);
	console.log('fb user status', status);
	
	if (resp.status === 'connected') {
	    FB.api('/me?fields=email,picture,name,permissions', function (response) {
		       Session.set("current_user", response);
		       if (!response.id) {
			   // ma
		       }
		       else {
			   window.cuser = response;
			   FBStatus.resolve();
			   FBLoggedIn.resolve();
			   publishView();
		       }
		   });
	}
	else {
	    FBStatus.resolve();
	}
    };
    
    fbfunction(function() {
	           FB.getLoginStatus(function(response) {
					 setStatus(response);
				     });
	           
	           FB.Event.subscribe('auth.login', function(response) {
					  setStatus(response);
				      });
	           
		   
	           FB.Event.subscribe('auth.authResponseChange', function(response) {
					  setStatus(response);
				      });
	           
	           FB.Event.subscribe('edge.create', // this happens after like
				      function(response) {
					  _gaq.push(['_trackEvent', 'Virality', 'like', response, 1]); 
					  
				      }
				     );
		   
	       })();

    verify_fb_status = fbfunction(function(cb) {
				      console.log('cuser', window.cuser);
				      if (status === 'SDKERR') {
					  _gaq.push(['_trackEvent', 'Errors', 'Player_Engagement_Error', 'SDKERR']);
					  return;
				      }
				      else if (!window.cuser || !window.cuser.permissions || JSON.stringify(window.cuser.permissions.data).indexOf('publish_actions') === -1) {
//					  $('#myModal').modal();
					  _gaq.push(['_trackEvent', 'Funnel', 'Player_user_not_verified', 'user']);
					  FB.login(function(response) {
						       if (response.authResponse) {
							   FBLoggedIn.done(cb);
						       }
						       else {
							   _gaq.push(['_trackEvent', 'Funnel', 'User_Cancel_Allow', '']);
						       }
						       setStatus(response);
						   }, {scope: 'email,publish_actions'});
				      }
				      else {
					  cb();
				      }
				      
				  }, FBStatus);
    
    window.fbAsyncInit = function() {
        FB.init({
		    appId      : '140153199345253', // App ID
		    status     : true, // check login status
		    cookie     : true, // enable cookies to allow the server to access the session
		    xfbml      : true  // parse XFBML
		});
	FBReady.resolve();
    };
    
    waitForFBSDK = function() {
	
	setTimeout(function() {
	               if (!FBReady.isResolved()) {
		           if (retrySDK) {
			       retrySDK = false;
			       waitForFBSDK();
			   }
		           else {
			       FBReady.reject();
			       if (!FBStatus.isResolved()) {
			           _gaq.push(['_trackEvent', 'Errors', 'PRXYSDKTIMEOUT', 'PRXYSDKTIMEOUT', 1]);
			           status = 'SDKERR';
			           FBStatus.resolve();
			       }
			   } 
		       }
	           }, 7000);
    };
    
    // Load the SDK Asynchronously
    (function(d){
         var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
         js = d.createElement('script'); js.id = id; js.async = true;
         js.src = "//connect.facebook.net/" + 'he_IL' + "/all.js";
         d.getElementsByTagName('head')[0].appendChild(js);
     }(document));
    
    fbfunction(function() {
	           FB.getLoginStatus(function(response) {
					 setStatus(response);
					 if (response.authResponse) {
				             
					 } else {
				             
					 }
				     });
	           
	       })();
					     
					     
					     };