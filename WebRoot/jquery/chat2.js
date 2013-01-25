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
    var userList = null;
	var chatWinList = [];
	
	var _wasConnected = false;
    var _connected = false;
    var _username;   
    var _password;
    var _lastUser;
    var _disconnecting;
    var _chatSubscription;
    var _membersSubscription;
	
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
        //$('#submit_login').click(function() { chat.join($('#username').val(),$('#password').val()); });
        $('#send_public').click(send_public);
        $('#submit_login').keyup(function(e)
        {
            if (e.keyCode == 13)
            {
                onLogin($('#username').val(),$('#password').val());
            }
        });
        //打开登录
       loginWin();
        
        //为人名绑定点击事件，弹出私聊对话框
        $(".chat").live("click",function(){
        
            var name=$( this ).text();
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
        
        
        $( '.chatWin' ).live( "dialogclose", function(event, ui) {

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
        
    });
    

    function loginWin(){  
    	//var chat=new Chat();
        $( "#login" ).dialog({
			height: 150,
			modal: true,
			  buttons: {
                     "登录": function() {
                     	 onLogin($('#username').val(),$('#password').val());
                         $(this).dialog("close");
                     }
			  }
		});
    };
   
    function openWin(name){
    	
		var openWin='<div id="'+name+'"title="'+name+'" class="chatWin"> <div id="private_img"><img alt="touxiang" src="css/tx1.jpg"><br><img alt="touxiang" src="css/tx2.jpg"></div> <div id="'+name+'privateContext" class="privateContext"></div> <div id="privateSend"> <input id="'+name+'privateMsg" class="privateMsg"/> </div> </div>';
		
		 $( "#privateChat").append(openWin);
		
		 $('.chatWin').dialog({
			      show: "blind",
			      hide: "explode",
			      height: 550,
			      minWidth:600,
                  buttons: {
                     "发送": function() {
                         //$(this).dialog("close");
                     	var lk='#'+name+'privateMsg';
                     	var msg=$(lk);
                     	var text=msg.val();                   	
                     	msg.val('');
                        if (!text || !text.length){
                        	 var html='<div id="emply" title="提示">输入内容不能为空，请输入！</div>';
                        	 $("#"+name).append(html);
                        	 $( "#emply" ).dialog({
                               close: function(event, ui) {  
                                       $("#emply").empty();
                                       $("#emply").remove(); 
                                   }
                              });
           	                 return;
                            }
                     	msgObj.fromuser=_username;
    	                msgObj.touser=name;
    	                msgObj.text=text;
    	                msgObj.type="c_private";
    	                send_private(msgObj);
                     	
                     },
                     "关闭": function() {
                         $(this).dialog("close");
                     }
                 }
             });

	  
             return openWin;
	};
	
    function onLogin(username,password){
    	    _disconnecting = false;
            _username = username;
            _password = password;
           if (username == "" || password == ""){  
	
	           var html='<div id="error" title="error"><p>username or password is error!!!</p></div>';
		       $('#login').append(html);
		       $( "#error" ).dialog({
                 close: function(event, ui) {  loginWin(); }
                });
		      
               //alert("username or password is error!!!");  
               return;  
           }

           // var cometdURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";

                var altServer = $('#altServer').val();
             
                //cometdURL = altServer;
              var cometdURL = "http://127.0.0.1:8080/web/cometd";
            

            $.cometd.websocketEnabled = true;
            $.cometd.configure({
                url: cometdURL,
                logLevel: 'debug'
            });
            $.cometd.handshake();
          $('#from').html(_username+" 说: ");
    }
    
    function send_public(){
    	    var msg = $('#msg'); 
            var text = msg.val();
           // alert(text);
            msg.val('');

           if (!text || !text.length){
           	    
           	     return;
           }
            msgObj.fromuser=_username;
            msgObj.touser="servlet";
            msgObj.text=text;
            msgObj.type="c_public";
            $.cometd.publish('/chat/dome',msgObj);
    }
    
    
    function send_private(msgObj){
    	//alert(msgObj.touser);
       $.cometd.publish('/chat/dome',msgObj);	
    }
    
    
    function Chat(state)
    {
        var _self = this;
      

        this.join = function(username,password)
        {
            _disconnecting = false;
            _username = username;
            _password = password;
           if (username == "" || password == ""){  
	
	           var html='<div id="error" title="error"><p>username or password is error!!!</p></div>';
		       $('#login').append(html);
		       $( "#error" ).dialog({
                 close: function(event, ui) {  loginWin(); }
                });
		      
               //alert("username or password is error!!!");  
               return;  
           }

           // var cometdURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";

                var altServer = $('#altServer').val();
             
                //cometdURL = altServer;
              var cometdURL = "http://127.0.0.1:8080/web/cometd";
            

            $.cometd.websocketEnabled = true;
            $.cometd.configure({
                url: cometdURL,
                logLevel: 'debug'
            });
            $.cometd.handshake();
          $('#from').html(_username+" 说: ");
           
        };

        this.leave = function()
        {
            $.cometd.batch(function()
            {
                $.cometd.publish('/chat/demo', {
                    user: _username,
                    membership: 'leave',
                    chat: _username + ' has left'
                });
                _unsubscribe();
            });
            $.cometd.disconnect();

            $('#join').show();
            $('#joined').hide();
            $('#username').focus();
            $('#members').empty();
            _username = null;
            _lastUser = null;
            _disconnecting = true;
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
        	 //alert("ni hao ya ");
        	
            var list ='' ;
	        //alert(list);
            $.each(message.data, function()
                {
                	//alert(this);
						list +='<span class="chat" id="'+ this
								+ '"><img alt="touxiang" src="css/tx.jpg" />'
								+ this + '</span><br> ';
					});
			$('#frident').html(list);
		
        };
        
        function reviceMessage(message){
        	
        	if(message.data.type==="c_public"){
        		
        		
        		dispMessage($("#context"),message);
        		
        	}else if(message.data.type==="c_private"){
        		//alert(message.data.type);
        		var i;
        		for(i=0;i<chatWinList.length;i++){
        			//本人发送出去的消息
        			if(chatWinList[i]!= null&& message.data.fromuser===_username&& message.data.touser===$(chatWinList[i]).attr("id")){
        				var id=$(chatWinList[i]).attr("id")+'privateContext';
        				var ls='#'+id;
        				//alert(ls);
        				//alert(chatWinList[i]);
        				dispMessage($(ls),message);
        				break;
        			}else if(chatWinList[i]!= null&&message.data.fromuser===$(chatWinList[i]).attr("id")&& message.data.touser===_username){
        				//本人接收到的信息
        				var id=$(chatWinList[i]).attr("id")+'privateContext';
        				var ls='#'+id;
        				//alert(ls);
        				//alert(chatWinList[i]);
        				dispMessage($(ls),message);
        				break;
        				
        			}
        		}
        		
        		if(i==chatWinList.length){
        			var fromuser=message.data.fromuser;
        			if(fromuser!=null&&message.data.touser===_username){
        				var chatWin=openWin(fromuser);
        			    chatWinList.push(chatWin);
        			    var id=$(chatWinList[i]).attr("id")+'privateContext';
        			    var id=message.data.fromuser+'privateContext';
        			    var ls='#'+id;        				
        		        dispMessage($(ls),message);
        			}
        			
        		}
        		
        		
        	}
        	
        }
        
        function dispMessage(conment,message){
       /*
        var now = new Date(); 
        
        var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();  
        var date = now.getFullYear() + " 年" +(now.getMonth()+1) + "月" +now.getDate() + "日"; // 有点怪的月份!
     
        var fromuser=message.data.fromuser;
        if(fromuser !=null){
        	var html = '<div><font color="green">'+fromuser+'</font> 说： '+message.data.text+'<font color="blue"> 【'+time+' '+date+'】'+'</font></div>';
       
        conment.append(html);
        }
        */
        var now = new Date();
        var date = now.getFullYear() + '/' +(now.getMonth()+1) + '/' +now.getDate();
        var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
        
         var fromuser=message.data.fromuser;
        if(fromuser !=null){
        	if(_username===fromuser){
        	    var html = '<div><font color="green">'+fromuser+'</font>  '+date+'  '+time+'<br /><font color="green">'+message.data.text+'</font></div>';
                conment.append(html);
        	}else{
        		
        		var html = '<div><font color="blue">'+fromuser+'</font>  '+date+'  '+time+'<br /><font color="blue">   '+message.data.text+'</font></div>';
                conment.append(html);
        		
        	}
        }
        
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
            _chatSubscription = $.cometd.subscribe('/chat/dome', reviceMessage);
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
            //alert(loginObj.username);
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
                _self.join(state.username);
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
