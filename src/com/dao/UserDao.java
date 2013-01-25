package com.dao;

import com.pojo.User;

public interface UserDao {
	
   public void saveUser(User user);
   
   public void updataUser(User user);
   
   public User findById(int id);


}
