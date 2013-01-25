package com.service.impl;

import javax.annotation.Resource;

import com.dao.UserDao;
import com.pojo.User;
import com.service.UserService;
import org.springframework.stereotype.Component;

@Component("userService")
public class UserServiceImpl implements UserService {
	
	private UserDao userDao;

	public UserDao getUserDao() {
		return userDao;
	}

	@Resource
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	@Override
	public boolean login(User user) {
		boolean isOk=false;	
		User u =this.userDao.findById(user.getId());
		if(u != null && user.getPassword().equals(u.getPassword())){
			isOk=true;
		}
		return isOk;
	}

	@Override
	public void addUser(User user) {
		this.userDao.saveUser(user);
		
	}

	@Override
	public void updataUser(User user) {
		this.userDao.updataUser(user);
	}

	@Override
	public User findUser(int id) {
		User user = this.userDao.findById(id);
		
		return user;
	}

	
}
