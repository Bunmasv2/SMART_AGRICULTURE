package com.smartfarm.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling  // Enable scheduled tasks (cron jobs)
public class FarmManagerApplication {

	public static void main(String[] args) {
		SpringApplication.run(FarmManagerApplication.class, args);
	}

}
