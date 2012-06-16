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

    
    window.publishBillAction = function(action, more) {
	var url = location.protocol + '//' + location.host + '/' +
	    '?vid=' + window.vid + '&ref=' + action + ':' + window.cuser.id;
	
	FB.api('/me/' + 'kolorabim' + ':' + action, 'post', 
	       $.merge({ bill :  url}, more),
	       function(response){
		   if (!response || response.error) {
		       _gaq.push(['_trackEvent', 'Errors', 'published_' + action + '_action', response.error, 1]);
		   }
		   else {
		       _gaq.push(['_trackEvent', 'Virality', 'published_' + action + '_action', JSON.stringify(response), 1]); 
		   }
	       });	
    };

    window.publishVote = function(type){
	window.publishBillAction('vote', {type: type});	
    };
    
    window.publishView = function(){
	window.publishBillAction('review', {});	     
    };


    var setStatus = function(resp) {
	if (status === resp.status){		
	    return; // there is no need to update
	}
	
	window.status = resp.status;
	Session.set('fbstatus', status);
	
	if (resp.status === 'connected') {
	    FB.api('/me?fields=email,picture,name,permissions', function (response) {
		       Session.set("current_user", response);
		       if (!response.id) {
			   // ma
		       }
		       else {
			   _gaq.push(['_setCustomVar', 1, 'USER', response.email, 2]);
			   _gaq.push(['_trackEvent', 'Funnel', 'userAuthed', response.email, 1]); 
			   window.cuser = response;
			   FBStatus.resolve();
			   FBLoggedIn.resolve();
			   setTimeout(function(){
					  publishView();
				      }, 15000);
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
					  _gaq.push(['_trackEvent', 'Virality', 'like', JSON.stringify(response), 1]); 
					  
				      }
				     );
		   
	       })();

    verify_fb_status = fbfunction(function(cb) {
				      if (status === 'SDKERR') {
					  _gaq.push(['_trackEvent', 'Errors', 'SDKERR', 'SDKERR']);
					  return;
				      }
				      else if (!window.cuser || !window.cuser.permissions || JSON.stringify(window.cuser.permissions.data).indexOf('publish_actions') === -1) {
					  _gaq.push(['_trackEvent', 'Funnel', 'Login Dialog', '.']);
					  FB.login(function(response) {
						       if (response.authResponse) {
							   _gaq.push(['_trackEvent', 'Funnel', 'User_Allowed', 'yes']);
							   FBLoggedIn.done(cb);
						       }
						       else {
							   _gaq.push(['_trackEvent', 'Funnel', 'User_Cancel_Allow', 'yes']);
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
			           _gaq.push(['_trackEvent', 'Errors', 'SDKTIMEOUT', 'SDKTIMEOUT', 1]);
			           status = 'SDKERR';
			           FBStatus.resolve();
			       }
			   } 
		       }
	           }, 8000);
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