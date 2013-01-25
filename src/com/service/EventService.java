package com.service;

import java.util.List;

import com.pojo.Event;

public interface EventService {

	public void addEvent(Event event);
	
	public List<Event> findByTouser(int touserId);
	
	public Event findById(int id);
	
	public void deleteEvent(Event event);
	
	
}
