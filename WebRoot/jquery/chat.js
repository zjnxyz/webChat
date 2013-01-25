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
	
	var nickname = "";
	var chatSubscription;
	var membersSubscription;
	var userList = null;
	var chatWinList = [];
	
    $(document).ready(function()
    {
        //$('#login').show();
        //$('#chat').hide();
        $('#privateChat').hide();
    	$('#submit_login').click(function() { login($('#username').val(),$('#password').val()); });
    	$('#send_public').click(function() { sendPublic($("context").val()); });
		
	   $(".chat").live("click",function(){
		   
		    var name=$( this ).text();
           
		    var i;
			for(i=0;i<chatWinList.length;i++){
				
                var nowName=$(chatWinList[i]).attr("id");
               
				if(chatWinList[i]!=null&&nowName==$(this).attr("id")){
				   
				   chatWinList[i].show();
				   break;
				}

				
			}
			
			 if(i===chatWinList.length){
				  var chat = openWin(name);
				  chatWinList.push(chat);

				}
				
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
       
         }); 
		 
	/*	 
	
	    $( ".chat" ).click(function() {
	
            var name=$( this ).text();
           
		    var i;
			for(i=0;i<chatWinList.length;i++){
				
                var nowName=$(chatWinList[i]).attr("id");
               
				if(chatWinList[i]!=null&&nowName==$(this).attr("id")){
				   
				   chatWinList[i].show();
				   break;
				}

				
			}
		    
			 if(i===chatWinList.length){
				  var chat = openWin(name);
				  chatWinList.push(chat);

				}

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

		});
	*/
    	
    });

	
function openWin(name){
		var openWin='<div id="'+name+'"title="'+name+'" class="chatWin"> <div id="private_img"><img alt="touxiang" src="css/tx1.jpg"><br><img alt="touxiang" src="css/tx2.jpg"></div> <div id="privateContext"></div> <div id="privateSend"> <input id="privateMsg" /><input type="submit" id="send2" value="send" /> </div> </div>';
		
		 $( "#privateChat").append(openWin);
		
		 $('.chatWin').dialog({
			      show: "blind",
			      hide: "explode",
			      height: 510,
			      minWidth:600,
                 buttons: {
                     "Ok": function() {
                         $(this).dialog("close");
                     },
                     "Cancel": function() {
                         $(this).dialog("close");
                     }
                 }
             });

	  
             return openWin;
	};
	
	
	
	
    
  function login(username,password){
  	
    var  cometdURL = location.protocol + "//" + location.host + config.contextPath + "/cometd";
    if (username == "" || password == ""){  
	
	       var html='<div id="error" title="error"><p>username or password is error!!!</p></div>'
		   $('#login').append(html);
		   $( "#error" ).dialog();
           //alert("username or password is error!!!");  
           return;  
        } 
       
    loginObj.username=username;
    loginObj.password=password;
    loginObj.type="new_login";
  	nickname=username;
  	
  	$.cometd.websocketEnabled = true;
  	
    $.cometd.configure({
         url: cometdURL,
         logLevel: 'debug'
        });
    $.cometd.handshake();
    $.cometd.publish("/service/members", loginObj);
 
     $('#login').hide();
     $('#chat').show();
     $('#privateChat').hide();
  	
  };
  
 function subscribe(){
           membersSubscription=$.cometd.subscribe('/service/members', receiveMembers);
           chatSubscription = $.cometd.subscribe('/chat/dome', receiveChat);
        }
        
 function connectionInitialized(){
  	
            // first time connection for this client, so subscribe tell everybody.
            $.cometd.batch(function()
            {
                subscribe();
                //$.cometd.publish("/chatroom", msgObj);
            });
        }
        
 function _metaHandshake(message){
 	
            if (message.successful)
            {
                connectionInitialized();
            }
        }
		

  $.cometd.addListener('/meta/handshake', _metaHandshake);
  
  function receiveChat(message){
  	
  	
  }
  
  function receiveMembers(message){
  	 var list = '<span class="chat" id="';
	 
     $.each(message.data, function()
     {
        list += this + '"><img alt="touxiang" src="css/tx.jpg">'+this+'</span><br> ';
     });
     $('#frident').html(list);
  }
  
  function sendPublic(con){
  	
  	var context=con;
  	 context.val('');
  	 msgObj.fromuser = nickname;   
     msgObj.text = context;  
     msgObj.type = "c_public"; 
    $.cometd.publish("/chat/dome", msgObj);
    
  }
  
   function sendPrivate(text, to){  
        msgObj.fromuser = nickname;  
        msgObj.touser = to;  
        msgObj.text = text;  
        msgObj.type = "c_private";  
        dojox.cometd.publish("/chat/dome", msgObj);  
    }  

})(jQuery);
