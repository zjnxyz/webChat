package com.action;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import org.apache.struts2.ServletActionContext;
import org.apache.struts2.json.annotations.JSON;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.opensymphony.xwork2.ActionSupport;
import com.pojo.User;
import com.service.UserService;

@SuppressWarnings("serial")
@Component("regsterAction")
@Scope("prototype")
public class RegsterAction extends ActionSupport {
	
	private UserService userService;
	HttpServletRequest request=ServletActionContext.getRequest();
	private String text;

	@Override
	public String execute() throws Exception {
		 String username=request.getParameter("username");
		 String password=request.getParameter("password");
		 String imgUrl=request.getParameter("imgUrl");
		 User u=new User();
		 u.setImgUrl(imgUrl);
		 u.setPassword(password);
		 u.setUsername(username);
		 if(u != null){
			 this.userService.addUser(u);
			 text=u.getUsername()+"注册成功";
		 }
		return SUCCESS;
	}

	@JSON(serialize=false)
	public UserService getUserService() {
		return userService;
	}

	@Resource
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}


}
