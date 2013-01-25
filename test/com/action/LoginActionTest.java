package com.action;


import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

import com.pojo.User;

public class LoginActionTest {

	@Test
	public void testExecute() {
		ApplicationContext ctx = new ClassPathXmlApplicationContext("beans.xml");
		LoginAction la=(LoginAction) ctx.getBean("loginAction");
		User user=new User();
		user.setId(1);
		user.setPassword("aa");
		la.setUser(user);
		try {
			la.execute();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}
