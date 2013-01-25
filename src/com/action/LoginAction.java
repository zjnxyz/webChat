package com.action;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.json.annotations.JSON;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.dto.UserDto;
import com.opensymphony.xwork2.ActionSupport;
import com.pojo.Friend;
import com.pojo.User;
import com.service.FriendService;
import com.service.UserService;

@SuppressWarnings("serial")
@Component("loginAction")
@Scope("prototype")
public class LoginAction extends ActionSupport  {

	HttpServletRequest request=ServletActionContext.getRequest();
	private UserService userService;
	private User user = new User();
	private List<UserDto> userList=new ArrayList<UserDto>();
	private FriendService friendService;
	private String type;
	
	@Override
	public String execute() throws Exception {
		List<Friend> friends=new ArrayList<Friend>();
        int id = Integer.parseInt(request.getParameter("id").trim());
        String password=request.getParameter("password").trim();
       
        User u2=new User();
        u2.setId(id);
        u2.setPassword(password);
		boolean isOk=this.userService.login(u2);
		if(isOk){
			friends=this.friendService.findFriend(u2.getId());
			for(Friend f:friends){
				UserDto ud=new UserDto();
				int friendId=f.getFriend().getId();
				System.out.println(friendId);
			    u2 = this.userService.findUser(friendId);
				ud.setId(u2.getId());
				ud.setImgUrl(u2.getImgUrl());
				ud.setUsername(u2.getUsername());
				if(ud !=null){
					userList.add(ud);
				}
			}
			type="success";
		}else{
			type="false";
			System.out.println(type);
		}
		
		for(UserDto udto:userList){
			System.out.println(udto.getUsername());
		}
		
		return SUCCESS;
	}
	
	
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	
	public List<UserDto> getUserList() {
		return userList;
	}
	public void setUserList(List<UserDto> userList) {
		this.userList = userList;
	}
	@JSON(serialize=false)
	public UserService getUserService() {
		return userService;
	}
	@Resource
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
	@JSON(serialize=false)
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}

	@JSON(serialize=false)
	public FriendService getFriendService() {
		return friendService;
	}

	@Resource
	public void setFriendService(FriendService friendService) {
		this.friendService = friendService;
	}


	
}
