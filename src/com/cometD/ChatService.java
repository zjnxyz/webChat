package com.cometD;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import javax.annotation.Resource;
import javax.inject.Inject;

import org.cometd.bayeux.client.ClientSessionChannel;
import org.cometd.bayeux.server.BayeuxServer;
import org.cometd.bayeux.server.ConfigurableServerChannel;
import org.cometd.bayeux.server.ServerMessage;
import org.cometd.bayeux.server.ServerSession;
import org.cometd.java.annotation.Configure;
import org.cometd.java.annotation.Listener;
import org.cometd.java.annotation.Service;
import org.cometd.java.annotation.Session;
import org.cometd.server.authorizer.GrantAuthorizer;
import org.cometd.server.filter.DataFilter;
import org.cometd.server.filter.DataFilterMessageListener;
import org.cometd.server.filter.JSONDataFilter;
import org.cometd.server.filter.NoMarkupFilter;

import com.pojo.Event;
import com.pojo.User;
import com.service.EventService;
import com.service.UserService;


@Service("chatService")
public class ChatService {
   
	private final ConcurrentMap<String, Map<Integer, String>> _members = new ConcurrentHashMap<String, Map<Integer, String>>();
	@Inject
	private BayeuxServer bayeux;
	@Session
	private ServerSession session;
	
	private EventService eventService;
	
	private UserService userService;
	
 

	@Configure ({"/chat/**","/members/**"})
	protected void configureChatStarStar(ConfigurableServerChannel channel){
	     DataFilterMessageListener noMarkup = new DataFilterMessageListener(new NoMarkupFilter(),new BadWordFilter());
	     channel.addListener(noMarkup);
	     channel.addAuthorizer(GrantAuthorizer.GRANT_ALL);
	    }
	 
	 @Configure ("/members/**")
	 protected void configureMembers(ConfigurableServerChannel channel){
	        channel.addAuthorizer(GrantAuthorizer.GRANT_PUBLISH);
	        channel.setPersistent(true);
	    }
	 
	 @Listener("/members/**")
	 public void handleMemberShip(ServerSession client, ServerMessage message){
		 Map<String, Object> data = message.getDataAsMap();
		 final String room = message.getChannel();
		 Map<Integer, String> roomMembers=_members.get(room);
		 if (roomMembers == null){
	            Map<Integer, String> new_room = new ConcurrentHashMap<Integer, String>();
	            roomMembers = _members.putIfAbsent(room, new_room);
	            if (roomMembers == null) roomMembers = new_room;
	        }
		 final Map<Integer, String> members = roomMembers;
		 Integer id = Integer.parseInt((String)data.get("id"));
		 members.put(id, client.getId());
		 client.addListener(new ServerSession.RemoveListener(){
	            public void removed(ServerSession session, boolean timeout){
	                members.values().remove(session.getId());
	                broadcastMembers(room,members.keySet());
	            }
	        });

	        broadcastMembers(room,members.keySet());
	 }
	
	private void broadcastMembers(String room, Set<Integer> members){
	        // Broadcast the new members list
	        ClientSessionChannel channel = session.getLocalSession().getChannel(room);
	        channel.publish(members);
	    }
	
	 @Configure ("/chat/**")
	 protected void configureChat(ConfigurableServerChannel channel){
	        channel.addAuthorizer(GrantAuthorizer.GRANT_PUBLISH);
	        channel.setPersistent(true);
	    }
	 
	 @Listener("/chat/**")
	 public void chat(ServerSession client,ServerMessage message){
		 Map<String,Object> data = message.getDataAsMap();
		 String type=(String) data.get("type");
		 String room= message.getChannel();
		 String msgType = (String) data.get("msgtype");
		 String peerId;
		 
		 if("new_login".equals(type)){ 
			 List<Map<String,Object>> chatList=this.getDbData(message);
			 ServerMessage.Mutable forward = bayeux.newMessage();
			 forward.setChannel(room);
			 forward.setId(message.getId());
			 for(Map<String,Object> m:chatList){
				 forward.setData(m);
				 client.deliver(session, forward);
			 }
			 
		 }
		 
		 if("c_public".equals(type)){
			 this.broadcastChatMessage(room, this.getData(message));
		 }
		 
		 if("c_private".equals(type)){
			 int id= Integer.parseInt((String)data.get("touser"));
			 Map<Integer,String> memberList = _members.get(room);
			 boolean isOk=this.isOnline(id, memberList.keySet());
			 ServerMessage.Mutable forward = bayeux.newMessage();
			 forward.setChannel(room);
			 forward.setId(message.getId());
			 forward.setData(this.getData(message));
			 /*
			  * if--start()
			  * 判断用户是否在线
			  * 如果用户在线直接将消息发给用户
			  * 如果不在线，则将消息保存到数据库
			  */
			 if(isOk){
				 peerId=memberList.get(id);
				 if(peerId !=null){
					 ServerSession peer=bayeux.getSession(peerId);
	        			if(peer !=null){	        				
	        				peer.deliver(session, forward);
	        			}
				 }
			 }else{
				 this.addEventToDB(data); 
			 } 
			 /*
			  * if--end()
			  */
			 //如果是聊天消息时，则给发送方先发回去
			 if("c_chat".equals(msgType)){
				 client.deliver(session, forward);
			 }
		 }
		 
		 
	 }
	 
	 //向公共聊天室或群组聊天室广播消息
	 private void broadcastChatMessage(String room,Map<String,Object> m){      
	        ClientSessionChannel channel = session.getLocalSession().getChannel(room);
	        channel.publish(m);
	    }
	 
	 //用户没在线，保存信息到数据库中
	 public void addEventToDB(Map<String,Object> m){
		 int fromuser =Integer.parseInt((String)m.get("fromuser"));//发送方用户ID
		 int touser =Integer.parseInt((String)m.get("touser"));    //接收方用户ID
		 String msgType=(String) m.get("msgtype");                //消息的类型，c_chat：聊天消息；c_event_add:添加好友消息
		 String text = (String) m.get("text");
		 Date time=new Date(); 
		 User fromUser = userService.findUser(fromuser);
		 User toUser = userService.findUser(touser);
		 Event e = new Event();
		 e.setFromUser(fromUser);
		 e.setToUser(toUser);
		 e.setMsgType(msgType);
		 e.setCreateTime(time);
		 e.setContext(text);
		 
		 eventService.addEvent(e);
		 
	 }
	
	public Map<String, Object> getData(ServerMessage message){
		 Map<String, Object> chat = new HashMap<String, Object>();
		 Map<String,Object> data = message.getDataAsMap();
		 String msgType = (String) data.get("msgType");
		 String chatChannel = (String) data.get("chatchannel");  //此处的room表示数据map里面客服端传过过来的，用来向其它被邀请的用户发送群组频道
		 String memberChannel = (String) data.get("memberchannel");//向频道广播在线人员
		 chat.put("fromuser", data.get("fromuser"));
		 chat.put("fromusername", data.get("fromusername"));
		 chat.put("touser",data.get("touser"));
		 chat.put("tousername",data.get("tousername"));
		 chat.put("text", data.get("text"));
		 chat.put("type", data.get("type")); //私聊或是公聊
		 chat.put("msgType", msgType);
		 if("c_event_group".equals(msgType)){
			 chat.put("chatchannel", chatChannel);
			 chat.put("memberchannel", memberChannel);
		 }
		 return chat;
	}
	
	public List<Map<String,Object>> getDbData(ServerMessage message){
		 
		 Map<String,Object> data = message.getDataAsMap();
		 List<Map<String,Object>> chatList=new ArrayList<Map<String,Object>>();
		 int id=Integer.parseInt((String)data.get("fromuser"));
		 SimpleDateFormat sdf = new SimpleDateFormat("HH:mm:ss yyyy-MM-dd");
		 List<Event>events=this.eventService.findByTouser(id);
		 for(Event e:events){
			 Map<String, Object> chat = new HashMap<String, Object>();
			 chat.put("fromuser", e.getFromUser().getId());
			 chat.put("fromusername", e.getFromUser().getUsername());
			 chat.put("touser", e.getToUser().getId());
			 chat.put("touser", e.getToUser().getUsername());
			 chat.put("type", "c_private");
			 chat.put("msgtype", e.getMsgType());
			 chat.put("text", e.getContext());
			 chat.put("createtime", sdf.format(e.getCreateTime()));
			 chatList.add(chat);	 
		 }
		 //chat.put("fromuser", )
		 return chatList;
	}
	
	public List<Event> getDbMessage(int id){
		List<Event> events = this.eventService.findByTouser(id);
		return events;
	}
	
	//判断用户是否在线
	public boolean isOnline(int id,Set<Integer> m){
		boolean isOk=false;
		for(int mId:m){
			if(id==mId){
				isOk=true;
				break;
			}
		}
		return isOk;
	}
	


	public EventService getEventService() {
		return eventService;
	}

	@Resource
	public void setEventService(EventService eventService) {
		this.eventService = eventService;
	}
	
    public UserService getUserService() {
			return userService;
		}

	@Resource
    public void setUserService(UserService userService) {
			this.userService = userService;
		}


	 class BadWordFilter extends JSONDataFilter
	    {
	        @Override
	        protected Object filterString(String string)
	        {
	            if (string.indexOf("dang")>=0)
	                throw new DataFilter.Abort();
	            return string;
	        }
	    }
}
