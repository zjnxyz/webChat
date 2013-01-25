package com.service.impl;

import java.util.List;

import javax.annotation.Resource;

import com.dao.FriendDao;
import com.dao.UserDao;
import com.pojo.Friend;
import com.pojo.User;
import com.service.FriendService;
import org.springframework.stereotype.Component;

@Component("friendService")
public class FriendServiceImpl implements FriendService {

	private FriendDao friendDao;
	private UserDao userdao;
	public UserDao getUserdao() {
		return userdao;
	}

	@Resource
	public void setUserdao(UserDao userdao) {
		this.userdao = userdao;
	}

	public FriendDao getFriendDao() {
		return friendDao;
	}

	@Resource
	public void setFriendDao(FriendDao friendDao) {
		this.friendDao = friendDao;
	}

	@Override
	public void addFriend(int userId, int friendId) {
	  Friend f=new Friend();
	  Friend f2=new Friend();
	  User user=this.userdao.findById(userId);
	  User friend=this.userdao.findById(friendId);
	  f.setFriend(friend);
	  f.setUser(user);
	  f2.setFriend(user);
	  f2.setUser(friend);
	  //互相加为好友
	  this.friendDao.save(f);
	  this.friendDao.save(f2);
		

	}

	@Override
	public List<Friend> findFriend(int userId) {
		List<Friend> friendList=this.friendDao.findByUserId(userId);
		return friendList;
	}

	@Override
	public Friend findOnlyFriend(int userId, int friendId) {
		Friend friend=this.friendDao.findByFriendId(userId, friendId);
		return friend;
	}

	@Override
	public void delete(Friend friend) {
		if(friend !=null){
			this.friendDao.delete(friend.getId());
		}else{
			System.out.println("好友关系不存�?");
		}
		
	}

}
