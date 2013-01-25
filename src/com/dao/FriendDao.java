package com.dao;

import java.util.List;

import com.pojo.Friend;


public interface FriendDao {


	public void save(Friend friend);

	public List<Friend> findByUserId(int userId);

	public Friend findByFriendId(int userId ,int friendId);

	public void delete(int id);
	

	public Friend findById(int id);
}
