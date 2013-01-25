package com.service.impl;

import java.util.List;

import javax.annotation.Resource;

import com.dao.EventDao;
import com.pojo.Event;
import com.service.EventService;
import org.springframework.stereotype.Component;

@Component("eventService")
public class EventServiceImpl implements EventService {

	private EventDao eventDao;

	public EventDao getEventDao() {
		return eventDao;
	}

	@Resource
	public void setEventDao(EventDao eventDao) {
		this.eventDao = eventDao;
	}
	@Override
	public void addEvent(Event event) {
		
		this.eventDao.save(event);

	}

	@Override
	public List<Event> findByTouser(int touserId) {
		List<Event> events=this.eventDao.findByTouser(touserId);
		return events;
	}

	@Override
	public Event findById(int id) {
		Event event=this.eventDao.findById(id);
		return event;
	}

	@Override
	public void deleteEvent(Event event) {
		this.eventDao.delete(event);
	}

}
