package com.prodapt.flowable.config;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.repository.EmployeeRepository;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (employeeRepository.count() == 0) {
            Employee emp1 = new Employee();
            emp1.setAttUid("john.doe");
            emp1.setEmail("john.doe@att.com");
            emp1.setRole("Developer");
            emp1.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp1.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(9).withMinute(0));
            emp1.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(17).withMinute(0));
            emp1.setFirstName("John");
            emp1.setLastName("Doe");

            Employee emp2 = new Employee();
            emp2.setAttUid("jane.smith");
            emp2.setEmail("jane.smith@att.com");
            emp2.setRole("Manager");
            emp2.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp2.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(8).withMinute(30));
            emp2.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(16).withMinute(30));
            emp2.setFirstName("Jane");
            emp2.setLastName("Smith");

            Employee emp3 = new Employee();
            emp3.setAttUid("bob.johnson");
            emp3.setEmail("bob.johnson@att.com");
            emp3.setRole("Analyst");
            emp3.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp3.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(10).withMinute(0));
            emp3.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(18).withMinute(0));
            emp3.setFirstName("Bob");
            emp3.setLastName("Johnson");

            Employee emp4 = new Employee();
            emp4.setAttUid("alice.brown");
            emp4.setEmail("alice.brown@att.com");
            emp4.setRole("Technician");
            emp4.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp4.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(7).withMinute(0));
            emp4.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(15).withMinute(0));
            emp4.setFirstName("Alice");
            emp4.setLastName("Brown");

            Employee emp5 = new Employee();
            emp5.setAttUid("chris.wilson");
            emp5.setEmail("chris.wilson@att.com");
            emp5.setRole("Supervisor");
            emp5.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp5.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(9).withMinute(30));
            emp5.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(17).withMinute(30));
            emp5.setFirstName("Chris");
            emp5.setLastName("Wilson");

            Employee emp6 = new Employee();
            emp6.setAttUid("david.lee");
            emp6.setEmail("david.lee@att.com");
            emp6.setRole("Operator");
            emp6.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp6.setShiftStart(ZonedDateTime.now(ZoneId.of("UTC")).withHour(11).withMinute(0));
            emp6.setShiftEnd(ZonedDateTime.now(ZoneId.of("UTC")).withHour(19).withMinute(0));
            emp6.setFirstName("David");
            emp6.setLastName("Lee");

            employeeRepository.saveAll(Arrays.asList(emp1, emp2, emp3, emp4, emp5, emp6));
            System.out.println("Sample employees loaded into database");
        }
    }
}
