(function($)
{
	
	var msgObj={
		fromuser:"",
		touser:"",
		type:"",
		text:""
	};
	
	var loginObj={
		username:"",
		password:"",
		type:""
	};
	var chatWinList = [];
	
	
    $(document).ready(function()
    {
        // Check if there was a saved application state
        var stateCookie = org.cometd.COOKIE?org.cometd.COOKIE.get('org.cometd.demo.state'):null;
        var state = stateCookie ? org.cometd.JSON.fromJSON(stateCookie) : null;
        var chat = new Chat(state);

        // restore some values
        if (state)
        {
            $('#username').val(state.username);
            $('#useServer').attr('checked',state.useServer);
            $('#altServer').val(state.altServer);
        }

        // Setup UI
        $('#privateChat').hide();
        $('#altServer').attr('autocomplete', 'off');
        $('#send_public').click(send_public);
        $('#submit_login').keyup(function(e)
        {
            if (e.keyCode == 13)
            {
                chat.onLogin($('#username').val(),$('#password').val());
            }
        });
        //打开登录
         loginWin();
        
        //为人名绑定点击事件，弹出私聊对话框
        $(".chat").live("click",function(){
        
           var name=$( this ).text();
           alert(name);
           if(name!=_username){
           	     var i;
			for(i=0;i<chatWinList.length;i++){
				
                var nowName=$(chatWinList[i]).attr("id");
               
				if(chatWinList[i]!=null&&nowName==$(this).attr("id")){
				   
				   chatWinList[i].show();
				   break;
				}

				
			}
			 if(i===chatWinList.length){
				  var chatWin = openWin(name);
				  chatWinList.push(chatWin);

				}
           	
           }
	
        });
        
        
   
      
    
    });
    
      function openWin(name){
    	
		var openWin='<div id="'+name+'"title="'+name+'" class="chatWin"> <div id="private_img"><img alt="touxiang" src="css/tx1.jpg"><br><img alt="touxiang" src="css/tx2.jpg"></div> <div id="'+name+'privateContext" class="privateContext"></div> <div id="privateSend"> <input id="'+name+'privateMsg" /> </div> </div>';
		
		 $( "#privateChat").append(openWin);
		
		 $('.chatWin').dialog({
			      show: "blind",
			      hide: "explode",
			      height: 510,
			      minWidth:600,
                  buttons: {
                     "发送": function() {
             
                     	var lk='#'+name+'privateMsg';
                     	var msg=$(lk);
                     	var text=msg.val();
                     	msg.val('');
                     	msgObj.fromuser=_username;
    	                msgObj.touser=name;
    	                msgObj.text=text;
    	                msgObj.type="c_private";
    	                _self.send_private(msgObj);
                     	
                     },
                     "关闭": function() {
                         $(this).dialog("close");
                     }
                 }
             });
             
         $( '.chatWin' ).bind( "dialogclose", function(event, ui) {

		      var j;

			  for(j=0;j<chatWinList.length;j++){
                  
                  if($(chatWinList[j]).attr("id")==$(this).attr("id")){
                         chatWinList[j]=null;
						break;
				  }				   
			  }      
                $(this).empty();
                $(this).remove();
           });

	  
             return openWin;
	};
    

    
    function Chat(state)
    {
        var _self = this;
        var _wasConnected = false;
        var _connected = false;
        var _username;   
        var _password;
        var _lastUser;
        var _disconnecting;
        var _chatSubscription;
        var _membersSubscription;
	
      
        

	  function loginWin(){  
        $( "#login" ).dialog({
			height: 150,
			modal: true,
			  buttons: {
                     "登录": function() {
                     	 chat.onLogin($('#username').val(),$('#password').val());
                         $(this).dialog("close");
                     }
			  }
		});
    };
    

      
        
  this.onLogin=function(username,password){
    	    _disconnecting = false;
            _username = username;
            _password = password;
           if (username == "" || password == ""){  
	
	           var html='<div id="error" title="error"><p>username or password is error!!!</p></div>';
		       $('#login').append(html);
		       $( "#error" ).dialog({
                 close: function(event, ui) {  _self.loginWin(); }
                });
		      
               return;  
           }


           var altServer = $('#altServer').val();
           var cometdURL = "http://127.0.0.1:8080/web/cometd";
            

            $.cometd.websocketEnabled = true;
            $.cometd.configure({
                url: cometdURL,
                logLevel: 'debug'
            });
            $.cometd.handshake();
          $('#from').html(_username+" 说: ");
    };
    
        
        
  this.send_public=function(){
    	    var msg = $('#msg'); 
            var text = msg.val();
            msg.val('');

            if (!text || !text.length) return;
            msgObj.fromuser=_username;
            msgObj.touser="servlet";
            msgObj.text=text;
            msgObj.type="c_public";
            $.cometd.publish('/chat/dome',msgObj);
    };
    
    
  this.send_private=function(msgObj){
  
       $.cometd.publish('/chat/dome',msgObj);	
    };
    
      
  

  this.receive = function(message)
        {
            var fromUser = message.data.user;
            var membership = message.data.membership;
            var text = message.data.chat;
            //alert(text);
            if (!membership && fromUser == _lastUser)
            {
                fromUser = '...';
            }
            else
            {
                _lastUser = fromUser;
                fromUser += ':';
            }

            var chat = $('#chat');
            var chat2 =$('#privatechat');
            if (membership)
            {
                chat.append('<span class=\"membership\"><span class=\"from\">' + fromUser + '&nbsp;</span><span class=\"text\">' + text + '</span></span><br/>');
                _lastUser = null;
            }
            else if (message.data.scope == 'private')
            {
            	
                chat2.append('<span class=\"private\"><span class=\"from\">' + fromUser + '&nbsp;</span><span class=\"text\">[private]&nbsp;' + text + '</span></span><br/>');
            }
            else
            {
                chat.append('<span class=\"from\">' + fromUser + '&nbsp;</span><span class=\"text\">' + text + '</span><br/>');
            }

            // There seems to be no easy way in jQuery to handle the scrollTop property
            chat[0].scrollTop = chat[0].scrollHeight - chat.outerHeight();
        };

        /**
         * Updates the members list.
         * This function is called when a message arrives on channel /chat/members
         */
        this.members = function(message)
        {
        
        	
            var list ='' ;
	       
            $.each(message.data, function()
                {
                
						list +='<span class="chat" id="'+ this
								+ '"><img alt="touxiang" src="css/tx.jpg" />'
								+ this + '</span><br> ';
					});
			$('#frident').html(list);
		
        };
        
        this.reviceMessage=function(message){
        	alert(message.data.type);
        	if(message.data.type==="c_public"){

        		dispMessage($("#context"),message);
        		
        	}else if(message.data.type==="c_private"){
        		var i;
        		for(i=0;i<chatWinList.length;i++){
        			
        			if(chatWinList[i]!= null&& message.data.fromuser===_username&& message.data.touser===$(chatWinList[i]).attr("id")){
        				var id=$(chatWinList[i]).attr("id")+'privateContext';
        				var ls='#'+id;
        				dispMessage($(ls),message);
        				break;
        			}else if(chatWinList[i]!= null&&message.data.fromuser===$(chatWinList[i]).attr("id")){
        				
        				var id=$(chatWinList[i]).attr("id")+'privateContext';
        				var ls='#'+id;
        				dispMessage($(ls),message);
        				break;
        				
        			}
        		}
      		
        		if(i==chatWinList.length){
        			
        			var chatWin=openWin(message.data.fromuser);
        			chatWinList.push(chatWin);
        			//var id=$(chatWinList[i]).attr("id")+'privateContext';
        			var id=message.data.fromuser+'privateContext';
        			var ls='#'+id;        				
        		    dispMessage($(ls),message);
        		}
        		
        		
        	}
        	
        };
        
        function dispMessage(conment,message){
       
        var now = new Date(); 
        
        var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();  
        var date = now.getFullYear() + " 年" +(now.getMonth()+1) + "月" +now.getDate() + "日"; // 有点怪的月份!
        
        var html = '<div><font color="green">'+message.data.fromuser+'</font> 说： '+message.data.text+'<font color="blue"> 【'+time+' '+date+'】'+'</font></div>';
      
        conment.append(html);
        }
        
      
        function _unsubscribe()
        {
            if (_chatSubscription)
            {
                $.cometd.unsubscribe(_chatSubscription);
            }
            _chatSubscription = null;
            if (_membersSubscription)
            {
                $.cometd.unsubscribe(_membersSubscription);
            }
            _membersSubscription = null;
        }

        function _subscribe()
        {
            _chatSubscription = $.cometd.subscribe('/chat/dome', _self.reviceMessage);
            _membersSubscription = $.cometd.subscribe('/members/demo', _self.members);
        }

        function _connectionInitialized()
        {
            // first time connection for this client, so subscribe tell everybody.
            $.cometd.batch(function()
            {
                _subscribe();
                
                
                $.cometd.publish('/chat/demo', {
                    user: _username,
                    membership: 'join',
                    chat: _username + ' has joined'
                });
            });
        }

        function _connectionEstablished()
        {
            // connection establish (maybe not for first time), so just
            // tell local user and update membership
            _self.receive({
                data: {
                    user: 'system',
                    chat: 'Connection to Server Opened'
                }
            });
            
            loginObj.username=_username;
            loginObj.password=_password;
            loginObj.type="new_login";
            $.cometd.publish('/service/members', loginObj);
        }

        function _connectionBroken()
        {
            _self.receive({
                data: {
                    user: 'system',
                    chat: 'Connection to Server Broken'
                }
            });
            $('#members').empty();
        }

        function _connectionClosed()
        {
            _self.receive({
                data: {
                    user: 'system',
                    chat: 'Connection to Server Closed'
                }
            });
        }

        function _metaConnect(message)
        {
            if (_disconnecting)
            {
                _connected = false;
                _connectionClosed();
            }
            else
            {
                _wasConnected = _connected;
                _connected = message.successful === true;
                if (!_wasConnected && _connected)
                {
                    _connectionEstablished();
                }
                else if (_wasConnected && !_connected)
                {
                    _connectionBroken();
                }
            }
        }

        function _metaHandshake(message)
        {
            if (message.successful)
            {
                _connectionInitialized();
            }
        }

        $.cometd.addListener('/meta/handshake', _metaHandshake);
        $.cometd.addListener('/meta/connect', _metaConnect);

        // Restore the state, if present
        if (state)
        {
            setTimeout(function()
            {
                // This will perform the handshake
                _self.onLogin(state.username,state.password);
            }, 0);
        }

        $(window).unload(function()
        {
            if ($.cometd.reload)
            {
                $.cometd.reload();
                // Save the application state only if the user was chatting
                if (_wasConnected && _username)
                {
                    var expires = new Date();
                    expires.setTime(expires.getTime() + 5 * 1000);
                    org.cometd.COOKIE.set('org.cometd.demo.state', org.cometd.JSON.toJSON({
                        username: _username,
                        password: _password,
                        useServer: $('#useServer').attr('checked'),
                        altServer: $('#altServer').val()
                    }), { 'max-age': 5, expires: expires });
                }
            }
            else
            {
                $.cometd.disconnect();
            }
        });
    }

})(jQuery);
