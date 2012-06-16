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
		     

		     if (!id) {
			 return;
		     }


		    Players.update(id, {$set: {vote: thevote}});  

		     if (Meteor.is_client || Meteor.is_simulation) {
			 _gaq.push(['_trackEvent', 'Funnel', 'User_Voted', vid + ' : ' + thevote]);
			 if (thevote === 1) {
			     publishVote('\u05d1\u05e2\u05d3');
			 }
			 else if (thevote === 0) {
			     publishVote('\u05e0\u05d2\u05d3');
			 }		     
		     }

//		    otherBills.update({'bill_id': vid}, {$set {yay: }});

		 }});

if (Meteor.is_client) {

    window.vid = getParameterByName('vid');
    window.ref = getParameterByName('ref');
        
    $.ajax({
	       url: 'http://oknesset.org/api/bill/' + window.vid + '/',
	       dataType: 'jsonp',
	       jsonp: 'callback',
               success: function(data){
		   Session.set('binfo', data);
		   var bill = data;
		   if (!bill || bill.votes) {
		       return;
		   }
		   $.each(bill.votes.all, function(j, v) {
			      var voters = !v ? 0 : v.count_against_votes + v.count_didnt_votes + v.count_for_votes;
//			      if (!hash[bill.url]) {
//				  hash[bill.url] = bill;
				  bill.voters = voters;
				  bill.bill_id = bill.url.replace('/bill/', '').replace('/', '');
				  Meteor.call('insertit', bill, function(e,r){
						  if (e) {
						      _gaq.push(['_trackEvent', 'Erros', 'insertit', JSON.stringify(e), 0, true]); 
						  }
					      });
//			      }
			      
			  });
               },
	       error: function(xhr, ajaxOptions, thrownError) {
		   _gaq.push(['_trackEvent', 'Erros', 'billxhr', JSON.stringify(thrownError), 0, true]); 
	       }
	   });

    window.updateBillsFromOknesset = function(){
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
					    $.each(data, function(i, bill) {
						       bill.bill_id = bill.url.replace('/bill/', '').replace('/', '');
						       $.each(bill.votes.all, function(j, v) {
								  if (!v) return;
								  var voters = v.count_against_votes + v.count_didnt_votes + v.count_for_votes;
								  if (voters > 50) {
//								      hash[bill.url] = bill;
								      bill.voters = voters;
								      
								      Meteor.call('insertit', bill, function(e,r){
										      if (e) {
											  _gaq.push(['_trackEvent', 'Erros', 'insertit', JSON.stringify(e), 0, true]); 
										      }
										  });
								  }
								  
							      });
						   });
					},
					error: function(xhr, ajaxOptions, thrownError) {
					    _gaq.push(['_trackEvent', 'Erros', 'otherBillsXhr', JSON.stringify(thrownError), 0, true]); 
					}
				    });
	       });
	
    };
    
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
	    _gaq.push(['_trackEvent', 'Funnel', 'User_Clicked_Vote', vid + ' : ' + (e.srcElement.id === 'voteyes' ? 1 : 0)]);
	    window.verify_fb_status(function() {
					var cuser = Session.get("current_user");
					if (!cuser || !cuser.id){
					    alert('BUT WHO ARE YOU');
					    _gaq.push(['_trackEvent', 'Error', 'WHO ARE YOU', 'WHO ARE YOU']);
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
 
    Meteor.methods({
		       insertit: function(bill) {
			   var found = otherBills.findOne({'bill_id': bill.bill_id});
			   if (!found) {
			       otherBills.insert(bill);
			       return 'inserted';
			   }
			   else {
			       otherBills.update({'bill_id': bill.bill_id}, {$set: bill});
			       return 'updated';
			   }

		       },
		       cleanOthers: function(){
			   var billz = otherBills.find({});
			   return null;
		       }
		   });

    Meteor.startup(function () {
//		       Players.remove({});
//		       Players.ensureIndex({fbid:1});		       
		   });
}


