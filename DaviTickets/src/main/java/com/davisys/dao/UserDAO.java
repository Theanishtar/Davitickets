package com.davisys.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.davisys.entity.Users;

public interface UserDAO extends JpaRepository<Users, Integer>{

}
