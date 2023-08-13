package com.davisys.controller;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import com.davisys.config.TestVNPAYConfig;
import com.davisys.constant.SessionAttribute;
import com.davisys.dao.MovieDAO;
import com.davisys.dao.PaymentDAO;
import com.davisys.dao.ShowtimeDAO;
import com.davisys.dao.UserDAO;
import com.davisys.entity.Movie;
import com.davisys.service.SessionService;

import javax.annotation.security.RolesAllowed;
import javax.websocket.Session;

@Controller
@RequestMapping("/admin")
@RolesAllowed("ROLE_ADMIN")
public class AdminController {
	@Autowired
	PaymentDAO paymentDao;
	@Autowired
	UserDAO userDao;
	@Autowired
	ShowtimeDAO showtimeDao;
	@Autowired
	SessionService sessionService;
	Date now = new Date();
	int day = Integer.valueOf(now.getDay());
	int month = Integer.valueOf(now.getMonth());
	
	@GetMapping("")
	public String index(Model m) {

		loadRevenueStatisticsDay(m);
		loadRevenueStatisticsMonth(m);
		loadPercent(m);
		loaduserStatisticsMonth(m);
		top3Hour(m);
		m.addAttribute("actived","active");

	return "admin/dasboard";
	}
	
	@GetMapping("a2")
	public String hel() {
		return "oauth/hello2";
	}
	
	public void loadRevenueStatisticsDay(Model m) {
		String revenueDay = paymentDao.revenueStatisticsDay(day);
		if(revenueDay == null) {
			revenueDay = "0";
		}
		m.addAttribute("revenueDay", revenueDay);
	}
	
	public void loadRevenueStatisticsMonth(Model m) {
		String revenueMonth = paymentDao.revenueStatisticsMonth(month);
		if(revenueMonth == null) {
			revenueMonth = "0";
		}
		m.addAttribute("revenueMonth", revenueMonth);
	}
	
	public void loadPercent(Model m) {
		String revenueDay = paymentDao.revenueStatisticsDay(day);
		String maxRevenueMonth = paymentDao.revenueStatisticsMaxDay(month);
		float percent = 0;
		if(revenueDay == null || maxRevenueMonth == null) {
			percent = 0;
		}else {
			float revenueToDay = Integer.valueOf(revenueDay);
			float maxRevenueInMonth = Integer.valueOf(maxRevenueMonth);
			percent = (revenueToDay / maxRevenueInMonth) * 100;
		}
		m.addAttribute("percent", percent);
	}
	
	public void loaduserStatisticsMonth(Model m) {
		String userStatisticsMonth = userDao.userStatisticsMonth(month);
		if(userStatisticsMonth == null) {
			userStatisticsMonth = "0";
		}
		m.addAttribute("userStatisticsMonth", userStatisticsMonth);
	}
	
	public void top3Hour(Model model) {
		String top1P = "", top2P = "", top3P = "";
		List<Object[]> listTop3 = showtimeDao.getTop3GoldenHour();
		int i = 0;
		for (Object[] oj : listTop3) {
			if (i == 0) {
				top1P = String.valueOf(oj[0]);
			}
			if (i == 1) {
				top2P = String.valueOf(oj[0]);
			}
			if (i == 2) {
				top3P = String.valueOf(oj[0]);
			}
			i++;
		}
		model.addAttribute("top1", top1P);
		model.addAttribute("top2", top2P);
		model.addAttribute("top3", top3P);
	}
	

	@GetMapping("/error")
	public String error(Model m) {
		return "error";
	}

	@RequestMapping("/logout")
	public String logout(Model m) {
		sessionService.set(SessionAttribute.CURRENT_USER, null);
		return "redirect:" + "http://localhost:4200/home";
	}

}
