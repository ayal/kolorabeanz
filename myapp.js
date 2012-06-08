// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players."
function getParameterByName(name)
{
    
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

if (Meteor.is_client) {
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
		   $.each(bill.votes.all, function(j, v) {
			      
			      if (!v) return;
			      var voters = v.count_against_votes + v.count_didnt_votes + v.count_for_votes;
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
	return otherBills.find({});
    };


    Template.oknesset.vid = function () {
	return window.vid;
    };

    Template.oknesset.commentsHref = function() {
	return location.href;  
    };



    Template.binfo.status = function () {
	var binfo = Session.get('binfo');
	return binfo ? binfo["stage_text"] : '... loading ...';
    };

    Template.myapp.players = function () {
	var x = Players.find({vid: window.vid}, {sort: {vote: -1, name: 1}});
	return x;
    };      

    Template.myapp.events = {
	'click input.inc': function (e) {
	    window.verify_fb_status(function(){
					var cuser = Session.get("current_user");
					if (!cuser){
					    alert('no user yet');
					    return;
					}
					var plr = Players.findOne({vid: window.vid, fbid: cuser.id});
					var id = null;
					if (!plr) {
					    id = Players.insert({fbid: cuser.id, name: cuser.name, vote: 0, vid: window.vid});
					}
					else {
					    id = plr._id;
					}
					console.log('id', id);
					
					if (e.srcElement.id === 'voteyes') {
					    Players.update(id, {$set: {vote: 1}});   
					    publishVote('\u05d1\u05e2\u05d3');
					}
					else {
					    Players.update(id, {$set: {vote: 0}});   
					    publishVote('\u05e0\u05d2\u05d3');
					}
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
/*    Template.OGZ.BILL_TITLE = function () {
	return 'LALA';
    };*/
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
			       return 3;
			   }
			   else {
			       return 2;
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


