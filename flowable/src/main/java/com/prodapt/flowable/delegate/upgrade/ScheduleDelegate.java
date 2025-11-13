package com.prodapt.flowable.delegate.upgrade;

import org.flowable.engine.delegate.DelegateExecution;
import org.flowable.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component("Schedule")
@RequiredArgsConstructor
public class ScheduleDelegate implements JavaDelegate {@Override
	public void execute(DelegateExecution execution) {		
	}

}
