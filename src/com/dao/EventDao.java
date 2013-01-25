package com.dao;

import java.util.List;

import com.pojo.Event;


public interface EventDao {
	
	public void save(Event event);

	public List<Event> findByTouser(int touserId);

	public void delete(Event event);
	

	public Event findById(int id);

}
