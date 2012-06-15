// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."
function getParameterByName(name) {
    
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);
  if(results == null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}



Players = new Meteor.Collection("players");
otherBills = new Meteor.Collection("others");

Meteor.methods({'upsertToPlayers': function(vid, cuser, thevote) {
		     var plr = Players.findOne({vid: vid, fbid: cuser.id});

		     if (!plr) {
			 id = Players.insert({fbid: cuser.id, name: cuser.name, vote: thevote, vid: vid});	
		     }
		     else {
			 id = plr._id;
		     }
		     
		     console.log('id', id);

		     if (!id) {
			 return;
		     }

		     Players.update(id, {$set: {vote: thevote}});  
		     
		     if (Meteor.is_client || Meteor.is_simulation) {
			 if (thevote === 1) {
			     publishVote('\u05d1\u05e2\u05d3');
			 }
			 else if (thevote === 0) {
			     publishVote('\u05e0\u05d2\u05d3');
			 }		     
		     }
		 }});

if (Meteor.is_client) {

    setTimeout(function(){
		   $('#myappid').popover({placement: 'left'});
		   $('#myappid').popover('show');
		   
	       }, 12000);

    window.vid = getParameterByName('vid');
    
    var hash = {
    };
    
    $.ajax({
	       url: 'http://oknesset.org/api/bill/' + window.vid + '/',
	       dataType: 'jsonp',
	       jsonp: 'callback',
               success: function(data){
		   Session.set('binfo', data);
		   var bill = data;
		   if (bill.votes)
		   $.each(bill.votes.all, function(j, v) {
			      
			     
			      var voters = !v ? 0 : v.count_against_votes + v.count_didnt_votes + v.count_for_votes;
			      if (!hash[bill.url]) {
				  hash[bill.url] = bill;
				  bill.voters = voters;
				  Meteor.call('insertit', bill, function(e,r){
						  console.log('>', e, r);
					      });
			      }
			      
			  });
               },
	       error: function(xhr, ajaxOptions, thrownError) {
		   console.log(arguments);
	       }
	   });

    Meteor.startup(function () {
		       
		       var context = {
			   
			   bills: []
		       };
		       var all = [];
		       
		       var thecount = Meteor.call('countit', 1, function(e, r){
						      if (r === 0) {
							  $.each([1, 1, 1, 1], function(page) {
								     var url = 'http://oknesset.org/api/bill/';
								     if (page !== 0) {
									 url += '?page_num=' + page;
								     }
								     var req = $.ajax({
											  url: url,
											  dataType: 'jsonp',
											  cache: true,
											  jsonp: 'callback',
											  success: function(data) {
											      console.log('bill');
											      $.each(data, function(i, bill) {
													 bill.bill_id = bill.url.replace('/bill/', '').replace('/', '');
													 $.each(bill.votes.all, function(j, v) {
														    if (!v) return;
														    var voters = v.count_against_votes + v.count_didnt_votes + v.count_for_votes;
														    if (voters > 50 && !hash[bill.url]) {
															hash[bill.url] = bill;
															bill.voters = voters;
															context.bills.push(bill);
															Meteor.call('insertit', bill, function(e,r){
																	console.log('>', e, r);
																    });
														    }

														});
												     });
											  },
											  error: function(xhr, ajaxOptions, thrownError) {
											      console.log(arguments);
											  }
										      });
								     all.push(req);

								 });
						      }
						  });
		   });
    
    Template.others.bills = function () {
	return otherBills.find({voters: {$gt: -1}}, {sort: {voters: -1}});
    };
    
    Template.others.active = function () {
	
	var cbill = Session.get('binfo');
	return this.url === cbill.url ? 'active' : 'notactive';
    };
    

    Template.oknesset.vid = function () {
	return window.vid;
    };

    Template.layout.valid = function () {
	return (window.vid ? 'yesvid' : 'novid');
    };

    Template.layout.sizeOfOthers = function () {
	return (window.vid ? 'span3' : 'span5');
    };

    Template.oknesset.commentsHref = function() {
	return location.href;  
    };

    Template.binfo.status = function () {
	var binfo = Session.get('binfo');
	return binfo ? binfo["stage_text"] : '... loading ...';
    };

    Template.myapp.players = function () {
	var x = Players.find({vid: window.vid, fbid: {$exists: true}}, {sort: {vote: -1, name: 1}});
	return x;
    };      

    Template.myapp.events = {
	'click input.inc': function (e) {
	    window.verify_fb_status(function() {
					var cuser = Session.get("current_user");
					if (!cuser || !cuser.id){
					    alert('WHO ARE YOU');
					    return;
					}
					
					Meteor.call('upsertToPlayers',
						    window.vid,
						    cuser,
						    e.srcElement.id === 'voteyes' ? 1 : 0,
						    function(){});
				    });
	}
    };

    Template.myapp.voted = function(vote) {
	return this.vote === parseInt(vote);
    };

    Template.player.events = {
	'click': function () {
	}
    };
}

// On server startup, create some players if the database is empty.
if (Meteor.is_server) {
    billshash = {};
    Meteor.methods({
		       countit: function () {
			   this.unblock();
			   return otherBills.find({}).count();
		       },
		       insertit: function(bill) {

			   if(!billshash[bill.url]) {
			       billshash[bill.url] = bill;
			       otherBills.insert(bill);
			       return 'inserted';
			   }
			   else {
			       return 'existed';
			   }

		       }
		   });

    Meteor.startup(function () {
		       var billz = otherBills.find({});
		       billz.forEach(function (bill) {
					 billshash[bill.url] = bill;
				     });
//		       Players.remove({});
//		       Players.ensureIndex({fbid:1});		       
		   });
}


