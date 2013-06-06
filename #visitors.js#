// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."
/*
Visitors = new Meteor.Collection("visitors");

Meteor.methods({'markMyVisit' :  function(cuser, cvid) {
  var expr = (new Date()).getTime() + 15000;
  if (this.is_simulation) {
      return;
  }
  if (!cuser) {
    var vstr = Visitors.findOne({_id: cvid});
    if (!vstr) {
      return Visitors.insert({fbid: 'ayal.gelles', name: 'Anonymous', expr: expr});   
    }
    else {
      Visitors.update(cvid, {$set: {expr: expr}});
      return cvid;
    }
  }
  else {
    var vstr = Visitors.findOne({fbid: cuser.id});
    if (vstr) {
      Visitors.update(vstr._id, {$set: {expr: expr}});
      return vstr._id;
    }
    else {
      return Visitors.insert({fbid: cuser.id, name: cuser.name, expr: expr}); 
    }
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
  
  Meteor.subscribe("thevisitors", function() {
    console.log('thevisitors');
    FBStatus.done(function(){
      Meteor.call('markMyVisit', Session.get("current_user"), window.cvid, function(e, r){
        window.cvid = r;
      });
      
      $(document).bind("active.idleTimer", function() {
        Meteor.call('markMyVisit', Session.get("current_user"), window.cvid, function(e, r){
          window.cvid = r;
        }); 
      });    
    });
  });
  
  Template.visitors.visitors = function () {
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

  Meteor.publish("thevisitors", function () {
    return Visitors.find({});
  });


  Meteor.setInterval(function(){
    Visitors.find({expr: {$lt: (new Date()).getTime()}}).forEach(function(visitor){
      Visitors.remove(visitor);
    });
  }, 8000);

  
  Meteor.startup(function () {
    //		       $(document).bind("idle.idleTimer", function(){
    
    //		       Players.remove({});
    //		       Players.ensureIndex({fbid:1});		       
  });
}


*/

peeps = new Meteor.Collection("dbalbums");

Meteor.methods({'upsert': function(sid, fbid) {
  console.log('upsert', sid, fbid);

  var expr = (new Date()).getTime() + 15000;
  if (fbid !== 'ayal.gelles') {
    peeps.remove({sid: {$ne: sid}, fbid: fbid});
  }

  if (!fbid || !sid) {
    console.log('WTF');
    return 'WTF';
  }
  
  var peep = peeps.findOne({sid: sid});
  if (peep) {
    console.log('updating', sid, fbid);
    peeps.update(peep._id, {$set: {expr: expr, fbid: fbid, sid: sid}});
    return 'udpate';
  }
  else {
    console.log('inserting', sid, fbid);
    peeps.insert({sid: sid, fbid: fbid, expr: expr});   
    return 'insert';
  }
}});

if (Meteor.isClient) {
  
  if (!getCookie('peepsid')) {
    setCookie('peepsid', (new Date()).getTime());
  }

  console.log('sid', getCookie('peepsid'));

  $.idleTimer(500);

  function setCookie (c_name,value) {
    var exdate=new Date();
    exdate.setDate(exdate.getDate() + 10000);
    var c_value=escape(value) + ((false) ? "" : "; expires="+exdate.toUTCString());
    document.cookie=c_name + "=" + c_value;
  };

  function getCookie (c_name) {
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

  window.FBStatus = $.Deferred();
  window.appid = function(){
    return location.href.indexOf('peeps.meteor.com') > -1 ? '485057264850802' : '485057264850802';	
  };

  window.fbAsyncInit = function(){
    FB.XFBML.parse();  
    FB.init({
      appId      : window.appid(), // App ID
      status     : true, // check login status
      cookie     : true, // enable cookies to allow the server to access the session
      xfbml      : true  // parse XFBML
    });
    FB.getLoginStatus(function(response) {
      window.fbdata = response;
      window.FBStatus.resolve(response);
    });
  };

  $(function(){
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  });

  Meteor.subscribe("thepeeps", function () {
    $(document).bind("active.idleTimer", function() {
      FBStatus.done(function() {
      console.log('status', window.fbdata, 'active');
        Meteor.call('upsert', getCookie('peepsid'), window.fbdata.authResponse ? window.fbdata.authResponse.userID : 'ayal.gelles', function(e,r){
          console.log(r);
        });
      });
    });


    console.log('the peeps!');    
    FBStatus.done(function() {
      console.log('status', window.fbdata, 'peeps');
      Meteor.call('upsert', getCookie('peepsid'), window.fbdata.authResponse ? window.fbdata.authResponse.userID : 'ayal.gelles', function(e,r){
        console.log(r);
      });
    });
  });

  Template.visitors.visitors = function () {
    return peeps.find({});
  };

  Template.visitors.events({
    'click input' : function () {
      FB.login(function(res) {
        console.log('logged in!', res);
        window.fbdata = res;
        Meteor.call('upsert', getCookie('peepsid'), window.fbdata.authResponse ? window.fbdata.authResponse.userID : 'ayal.gelles', function(e,r){
          console.log(r);
        });
      }, {scope: "publish_actions"});
    }
  });
}

if (Meteor.isServer) {
  Meteor.publish("thepeeps", function () {
    return peeps.find({});
  });

  Meteor.startup(function () {
    Meteor.setInterval(function(){
      peeps.find({expr: {$lt: (new Date()).getTime()}}).forEach(function(peep){
        peeps.remove(peep);
      });
    }, 8000);
  });
}
