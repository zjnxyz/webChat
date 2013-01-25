package com.dao.impl;

import javax.annotation.Resource;

import com.dao.UserDao;
import com.pojo.User;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Component;

@Component("userDao")
public class UserDaoImpl implements UserDao {
	
	private HibernateTemplate hibernateTemplate;

	public HibernateTemplate getHibernateTemplate() {
		return hibernateTemplate;
	}

	@Resource
	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}

	@Override
	public void saveUser(User user) {
		if(user != null){
			this.hibernateTemplate.save(user);
		}

	}

	@Override
	public void updataUser(User user) {
		if(user != null){
			this.hibernateTemplate.update(user);
		}

	}

	@Override
	public User findById(int id) {
		User user=(User) this.hibernateTemplate.get(User.class, id);
		return user;

	}

}
