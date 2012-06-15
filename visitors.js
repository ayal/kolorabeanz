// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."

Visitors = new Meteor.Collection("visitors");

Meteor.methods({'markMyVisit' :  function(cuser, cvid) {
		    console.log('marking on the client', cuser, cvid);
		    var expr = (new Date()).getTime() + 15000;
		    if (!cuser){
			console.log('no cuser', cuser);
			if (cvid) {
			    var objToUpdate = Visitors.findOne({_id: cvid});
			    if (!objToUpdate) {
				if (Meteor.is_simulation || Meteor.is_client) {
				    window.cvid = null; // invalidate the cvid on the client since it was delete by the server's cleanup
				}
				return Visitors.insert({fbid: 'ayal.gelles', name: 'Anonymous', expr: expr});
			    }

			    Visitors.update(cvid, {$set: {expr: expr}});
			    return cvid;
			}
			
			return Visitors.insert({fbid: 'ayal.gelles', name: 'Anonymous', expr: expr});
		    }
		    else {
			console.log('yes cuser', vid);
			var vid = Visitors.findOne({fbid: cuser.id});
			if (!vid) {
			    return Visitors.insert({fbid: cuser.id, name: cuser.name, expr: expr});
			}
			
			var idToUpdate = cvid || vid._id;
			var objToUpdate = Visitors.findOne({_id: idToUpdate});
			console.log('idtoupdate', idToUpdate);
			if (typeof objToUpdate === 'undefined' || !idToUpdate) {
			    if (Meteor.is_simulation || Meteor.is_client) {
				window.cvid = null; // invalidate the cvid on the client since it was delete by the server's cleanup
			    }
			    return Visitors.insert({fbid: cuser.id, name: cuser.name, expr: expr});
			}

			
			Visitors.update(idToUpdated, {$set: {fbid: cuser.id, name: cuser.name, expr: expr}});
			return idToUpdate;

			return undefined;
		    }
		}});


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
    $.idleTimer(500);
    
		    
    FBStatus.done(function(){
		      Meteor.call('markMyVisit', Session.get("current_user"), window.cvid, function(e, r){
				      console.log('got cvid', r);
				      window.cvid = r;
				  });
		  });

    $(document).bind("active.idleTimer", function() {
			 console.log('marking visit');
			 Meteor.call('markMyVisit', Session.get("current_user"), window.cvid, function(e, r){
					 console.log('got cvid', r);
					 window.cvid = r;
				     }); 
		     });    

    
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

    Meteor.setInterval(function(){
			   Visitors.find({expr: {$lt: (new Date()).getTime()}}).forEach(function(visitor){
											    Visitors.remove(visitor);
											});
		       }, 30000);

    
    Meteor.startup(function () {
		       //		       $(document).bind("idle.idleTimer", function(){
		       
		       //		       Players.remove({});
		       //		       Players.ensureIndex({fbid:1});		       
		   });
}


