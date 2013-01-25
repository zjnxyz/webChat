package com.service;

import java.util.List;

import com.pojo.Friend;

public interface FriendService {
	
	public void addFriend(int userId,int friendId);

	public List<Friend> findFriend(int userId);

	public Friend findOnlyFriend(int userId,int friendId);

	public void delete(Friend friend);

}
