package com.dao.impl;

import java.util.ArrayList;
import java.util.List;

import javax.annotation.Resource;

import com.dao.FriendDao;
import com.pojo.Friend;
import com.pojo.User;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Component;

@Component("friendDao")
public class FriendDaoImpl implements FriendDao {
	
	private HibernateTemplate hibernateTemplate;

	public HibernateTemplate getHibernateTemplate() {
		return hibernateTemplate;
	}

	@Resource
	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}

	@Override
	public void save(Friend friend) {
		if(friend != null){
			 this.hibernateTemplate.save(friend);
		}else{
			System.out.println("friend is null");
		}
		   

	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Friend> findByUserId(int userId) {
		
		String HQL="from Friend f where f.user.id = ?";
		List<Friend> friendList=this.hibernateTemplate.find(HQL, userId);
		return friendList;
	}

	@Override
	public Friend findByFriendId(int userId, int friendId) {
		Friend friend=new Friend();
		String HQL="from Friend f where f.user.id = "+userId+" and f.friend.id ="+friendId;
		friend=(Friend) this.hibernateTemplate.find(HQL).get(0);
		return friend;
	}

	@Override
	public void delete(int id) {
		Friend friend=findById(id);
		if(friend != null){
			this.hibernateTemplate.delete(friend);
		}else{
			System.out.println("该用户不存在");
		}

	}

	@Override
	public Friend findById(int id) {
		Friend friend = (Friend) this.hibernateTemplate.get(Friend.class, id);
		return friend;
	}

}
