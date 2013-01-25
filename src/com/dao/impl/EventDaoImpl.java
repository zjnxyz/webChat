package com.dao.impl;

import java.util.List;

import javax.annotation.Resource;

import com.dao.EventDao;
import com.pojo.Event;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Component;

@Component("eventDao")
public class EventDaoImpl implements EventDao {

	private HibernateTemplate hibernateTemplate;
	
	public HibernateTemplate getHibernateTemplate() {
		return hibernateTemplate;
	}

	@Resource
	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}

	@Override
	public void save(Event event) {
		this.hibernateTemplate.save(event);
	}

	@Override
	public Event findById(int id) {
		Event event = (Event) this.hibernateTemplate.get(Event.class, id);
		return event;
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Event> findByTouser(int touserId) {
		String HQL="from Event e where e.toUser.id = ?";
		List<Event> events=this.hibernateTemplate.find(HQL,touserId);
		return events;
	}

	@Override
	public void delete(Event event) {
		this.hibernateTemplate.delete(event);	
	}


}
