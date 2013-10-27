window.nsSite1628 =
{
	logonStayOnDocument: true,
	loading: '<img class="ns1blankspaceLoading" id="ns1blankspaceLoading" src="/jscripts/images/1blankspace.loading.square.20.gif">',
	messaging: {},
	conversation: 14160
};

$(function() 
{	
	$('#divLogo').click(function() {document.location.href = 'http://www.ibcom.biz'})

	if (msOnDemandDocumentId == 54640)
	{
		nsSite1628.init({prefix: 'Add comment as '});
		nsSite1628.context = (mydigitalstructureContextId).split(':');
	}	
	else
	{
		nsSite1628.init();
	}	
	

	if (msOnDemandDocumentId == 54650)
	{
		nsSite1628.logon.init();
	}
});

nsSite1628.init =
				function(oParam, oResponse)
				{
					$('#postSearch').keyup(function(event)
					{
					if (nsSite1628.delayCurrent != 0) {clearTimeout(nsSite1628.delayCurrent)};
				       nsSite1628.delayCurrent = setTimeout('nsSite1628.messaging.conversation.post.search()', 400);
					});

					if (oResponse === undefined)
					{	
						$('div.logonContainer').html(nsSite1628.loading);
						$.ajax(
						{
							type: 'GET',
							url: '/rpc/core/?method=CORE_GET_USER_DETAILS',
							dataType: 'json',
							cache: false,
							global: false,
							success: function(data) 
							{
								nsSite1628.init(oParam, data);
							}
						});
					}
					else
					{	
						if (oResponse.status === 'OK')
						{
							nsSite1628.user = oResponse.user;
							nsSite1628.userLogonName = oResponse.userlogonname;
						}	

						var sPrefix = ns1blankspace.util.getParam(oParam, 'prefix', {"default": ''}).value;

						if (nsSite1628.user == undefined)
						{
							$('div.logonContainer').html('<a href="https://ibcom-community.1blankspace.com/forum-logon">' +
															'log on</a>')
						}	
						else
						{
							$('div.logonContainer').html(sPrefix + nsSite1628.userLogonName);

							nsSite1628.messaging.conversation.post.show();

							$('div.commentContainer').html(
								'<div style="margin-bottom:8px;"><textarea id="commentText"></textarea></div>' +
								'<div id="commentSend"></div>');

							$('#commentSend').button(
							{
								label: "Send Comment"
							})
							.click(function() 
							{
								nsSite1628.messaging.conversation.comment.send();
							});
						}
					}	
				}
		
nsSite1628.logon =
{
	init: 		function ()
				{
					$('#ns1blankspaceLogonLogonName').focus();

					$('#ns1blankspaceLogonSend').button(
					{
						label: "Logon"
					})
					.click(function() 
					{
						nsSite1628.logon.send();
					});
				},	

	send: 		function (oParam)
				{
					var iAuthenticationLevel = 1;

					var oData = 
					{
						method: 'LOGON',
						logon: $('#ns1blankspaceLogonLogonName').val()
					}	

					if (iAuthenticationLevel == 1)
					{
						oData.passwordhash = ns1blankspace.util.hash({value: $('#ns1blankspaceLogonLogonName').val()
							  + $('#ns1blankspaceLogonPassword').val()})
					}
					else if (iAuthenticationLevel == 2)
					{
						oData.passwordhash = ns1blankspace.util.hash({value: $('#ns1blankspaceLogonLogonName').val()
							  + $('#ns1blankspaceLogonPassword').val() + ns1blankspace.logonKey})
					}
					else if (iAuthenticationLevel == 3)
					{
						oData.passwordhash = ns1blankspace.util.hash({value: $('#ns1blankspaceLogonLogonName').val()
							  + $('#ns1blankspaceLogonPassword').val() + ns1blankspace.logonKey + $('#ns1blankspaceLogonPasswordCode').val()})
					}
					
					$('#ns1blankspaceLogonStatus').html(nsSite1628.loading);
					
					$.ajax(
					{
						type: 'POST',
						url: '/rpc/logon/',
						data: oData,
						dataType: 'json',
						success: this.process
					})
				},

	process: 	function (oResponse)	
				{		
					if (oResponse.status === 'ER')
					{
						$('#ns1blankspaceLogonStatus').html('Logon name or password is incorrect.');
						$('#ns1blankspaceContainer').effect("shake", { times:2 }, 100);
					}
					else 
					{
						$('#ns1blankspaceLogonStatus').html('Logon successful...');
						
						if ($('#ns1blankspaceLogonRemember').attr('checked'))
						{
							$.cookie('mydigitalstucturelogonname', $('#ns1blankspaceLogonLogonName').val(), {expires:30});
						}
						
						var sStatus = (oResponse.passwordStatus!==undefined?oResponse.passwordStatus:oResponse.PasswordStatus);

						if (sStatus === "EXPIRED")
						{
							ns1blankspace.logon.changePassword.show(); 
						}
						else
						{	
							if (oResponse.url === '#' || nsSite1628.logonStayOnDocument)
							{
								document.location.href = (document.location.href).replace('-logon', '');
							}	
							else
							{
								document.location.href = oResponse.url;
							}
						}
					}
				}				
}

nsSite1628.messaging.conversation =
{
	post: 		{
					search: 	function (oParam, oResponse)
								{
									if (oResponse === undefined)
									{	
										$('#postSearchResults').html(nsSite1628.loading);

										var oSearch = new AdvancedSearch();
										oSearch.method = 'MESSAGING_CONVERSATION_POST_SEARCH';
										oSearch.addField('subject');
										oSearch.rows = 25;
										oSearch.addFilter('subject', 'TEXT_IS_LIKE', $('#postSearch').val());
										oSearch.addFilter('conversation', 'EQUAL_TO', nsSite1628.conversation)
										oSearch.sort('subject', 'asc');
										oSearch.getResults(function (data) {nsSite1628.messaging.conversation.post.search(oParam, data)});
									}
									else
									{	
										if (oResponse.data.rows.length == 0)
										{	
											$('#postSearchResults').html('');
										}
										else
										{	
											var aHTML = [];

											aHTML.push('<table id="postSearchResultsContainer" style="width: 100%;" cellpadding=4>');

											$(oResponse.data.rows).each(function()
											{
												aHTML.push('<tr><td id="postSearchResults-' + this.id + '" class="ns1blankspaceRowSelect">' +
																'<a href="/forum-blog/post:' + this.id + '">' + this.subject + '</a></td></tr>');
											});			
															
											aHTML.push('</table>');
										}	

										$('#postSearchResults').html(aHTML.join(''));
									}		
								},

					show: 		function()
								{
									$('div.postContainer').html(
										'<div style="margin-bottom:8px;"><textarea id="postText"></textarea></div>' +
										'<div id="postSend"></div>');

									$('#postSend').button(
									{
										label: "Send Post"
									})
									.click(function() 
									{
										nsSite1628.messaging.conversation.post.send();
									});
								},

					send:XXX		function(oParam, oResponse)
								{
									var oData =
									{
										message: $('#commentText').val(),
										post: nsSite1628.context[1]
									}	
										
									$('div.commentContainer').html(nsSite1628.loading);
										
									$.ajax(
									{
										type: 'POST',
										url: '/ondemand/messaging/?method=MESSAGING_CONVERSATION_POST_COMMENT_MANAGE',
										data: oData,
										dataType: 'json',
										success: function(data)
										{
											if (data.status == 'OK')
											{
												$('div.commentContainer').html('Comment sent.');
											}
											else
											{
												$('div.commentContainer').html('Comment could not be sent.');
											}	
										}
									});	
								}								
				},

	comment: 	{
					send: 		function(oParam, oResponse)
								{
									var oData =
									{
										message: $('#commentText').val(),
										post: nsSite1628.context[1]
									}	
										
									$('div.commentContainer').html(nsSite1628.loading);
										
									$.ajax(
									{
										type: 'POST',
										url: '/ondemand/messaging/?method=MESSAGING_CONVERSATION_POST_COMMENT_MANAGE',
										data: oData,
										dataType: 'json',
										success: function(data)
										{
											if (data.status == 'OK')
											{
												$('div.commentContainer').html('Comment sent.');
											}
											else
											{
												$('div.commentContainer').html('Comment could not be sent.');
											}	
										}
									});	
								}
				}
}


	 		




