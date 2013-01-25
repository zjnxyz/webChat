package com.service;

import com.pojo.User;

public interface UserService {

	public boolean login(User user);
	

	public void addUser(User user);

	public void updataUser(User user);

	public User findUser(int id);

}
