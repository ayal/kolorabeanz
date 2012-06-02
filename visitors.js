// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Visitors = new Meteor.Collection("visitors");

if (Meteor.is_client) {

    function setCookie(c_name,value,exdays) {
	
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + exdays);
	var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
	document.cookie=c_name + "=" + c_value;
    };

    function getCookie(c_name) {
	
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
	    
	    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
	    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
	    x=x.replace(/^\s+|\s+$/g,"");
	    if (x==c_name)
	    {
		
		return unescape(y);
	    }
	}
    };

    // idleTimer() takes an optional argument that defines the idle timeout
    // timeout is in milliseconds; defaults to 30000
    $.idleTimer(1000);
    
    $(document).bind("idle.idleTimer", function(){
			 window.markMyVisit(window.cvid); 
     		     });
    
    // 
    Meteor.startup(function () {
		       window.FBStatus = window.FBStatus || $.Deferred();
		       FBStatus.done(function(){
					 $(document).bind("active.idleTimer", function(){
							      window.markMyVisit(window.cvid);		 
							  });
				     });
		   });

    Meteor.setInterval(function(){
			   console.log('idle');
			   Visitors.remove({expr: {$lt: (new Date()).getTime()}});
		       }, 10000);


    window.markMyVisit = function(cvid) {
	//    Meteor.setInterval(function() {
	if (!cvid) {
	    cvid = getCookie('cvid');
	    if (cvid === 'undefined') {
		cvid = null;
	    }
	}
	var cuser = Session.get("current_user");
	console.log('visitors count: ', Visitors.find({}).count());
	var expr = (new Date()).getTime() + 15000;
	if (!cuser){
	    if (!cvid) {
		console.log('no cuser no cvid, insert!');
		window.cvid = Visitors.insert({fbid: 'ayal.gelles', name: 'Anonymous', expr: expr});
	    }
	    else {
		console.log('no cuser yes cvid');
		var vid = Visitors.findOne(cvid);
		if (vid) {
		    console.log('.. and in db');
		}
		else {
		    console.log('.. NOT in db');
		    window.cvid = Visitors.insert({fbid: 'ayal.gelles', name: 'Anonymous', expr: expr});
		}

	    }
	}
	else {

	    var vid = Visitors.findOne({fbid: cuser.id});
	    if (!cvid) {
		if (vid) {
		    console.log('cuser no cvid already in db');
		    window.cvid = vid._id;   
		}
		else {
		    console.log('cuser no cvid not in db insert!', cuser.id);
		    window.cvid = Visitors.insert({fbid: cuser.id, name: cuser.name, expr: expr});

		}
	    }
	    else {
		if (vid) {
		    console.log('cuser and cvid already in db', vid);
		    if (vid.name !== cuser.name) {
			console.log('deleting');
			Visitors.remove(cvid);	 
		    }
		}
		else {
		    console.log('removing', cvid);
		    Visitors.remove(cvid);
		    console.log('cuser and cvid, not in db, insert!', vid, cuser.id);
		    window.cvid = Visitors.insert({fbid: cuser.id, name: cuser.name, expr: expr});
		}
	    }
	}
	setCookie('cvid', window.cvid, 100);
    };

    Template.visitors.visitors = function () {
	console.log('visitorz');

	var x = Visitors.find({});
	return x;
    };   
    
    Template.visitor.ff = function(){
	// function you want to fire when the user becomes active again
	return 'kaka';

    };

}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
    
    Meteor.startup(function () {
//		       $(document).bind("idle.idleTimer", function(){
  
//		       Players.remove({});
//		       Players.ensureIndex({fbid:1});		       
		   });
}


