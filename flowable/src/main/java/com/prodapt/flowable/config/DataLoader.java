package com.prodapt.flowable.config;

import java.time.LocalTime;
import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.prodapt.flowable.entity.Employee;
import com.prodapt.flowable.entity.Shift;
import com.prodapt.flowable.repository.EmployeeRepository;
import com.prodapt.flowable.repository.ShiftRepository;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    @Override
    public void run(String... args) throws Exception {
        if (shiftRepository.count() == 0 && employeeRepository.count() == 0) {
            // Create sample shifts first
            Shift morningShift = new Shift();
            morningShift.setCode("MORNING");
            morningShift.setStartTime(LocalTime.of(9, 0));
            morningShift.setEndTime(LocalTime.of(17, 0));
            morningShift.setDuration(8);

            Shift earlyShift = new Shift();
            earlyShift.setCode("EARLY");
            earlyShift.setStartTime(LocalTime.of(7, 0));
            earlyShift.setEndTime(LocalTime.of(15, 0));
            earlyShift.setDuration(8);

            Shift lateShift = new Shift();
            lateShift.setCode("LATE");
            lateShift.setStartTime(LocalTime.of(11, 0));
            lateShift.setEndTime(LocalTime.of(19, 0));
            lateShift.setDuration(8);

            shiftRepository.saveAll(Arrays.asList(morningShift, earlyShift, lateShift));

            // Create employees and assign shifts
            Employee emp1 = new Employee();
            emp1.setAttUid("john.doe");
            emp1.setEmail("john.doe@att.com");
            emp1.setRole("Developer");
            emp1.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp1.setFirstName("John");
            emp1.setLastName("Doe");
            emp1.setActive(true);
            emp1.setShift(morningShift);

            Employee emp2 = new Employee();
            emp2.setAttUid("jane.smith");
            emp2.setEmail("jane.smith@att.com");
            emp2.setRole("Manager");
            emp2.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp2.setFirstName("Jane");
            emp2.setLastName("Smith");
            emp2.setActive(true);
            emp2.setShift(earlyShift);

            Employee emp3 = new Employee();
            emp3.setAttUid("bob.johnson");
            emp3.setEmail("bob.johnson@att.com");
            emp3.setRole("Analyst");
            emp3.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp3.setFirstName("Bob");
            emp3.setLastName("Johnson");
            emp3.setActive(true);
            emp3.setShift(lateShift);

            Employee emp4 = new Employee();
            emp4.setAttUid("alice.brown");
            emp4.setEmail("alice.brown@att.com");
            emp4.setRole("Technician");
            emp4.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp4.setFirstName("Alice");
            emp4.setLastName("Brown");
            emp4.setActive(true);
            emp4.setShift(earlyShift);

            Employee emp5 = new Employee();
            emp5.setAttUid("chris.wilson");
            emp5.setEmail("chris.wilson@att.com");
            emp5.setRole("Supervisor");
            emp5.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp5.setFirstName("Chris");
            emp5.setLastName("Wilson");
            emp5.setActive(true);
            emp5.setShift(morningShift);

            Employee emp6 = new Employee();
            emp6.setAttUid("david.lee");
            emp6.setEmail("david.lee@att.com");
            emp6.setRole("Operator");
            emp6.setSkills(Arrays.asList("Upgrade", "NewInstall"));
            emp6.setFirstName("David");
            emp6.setLastName("Lee");
            emp6.setActive(true);
            emp6.setShift(lateShift);

            employeeRepository.saveAll(Arrays.asList(emp1, emp2, emp3, emp4, emp5, emp6));
            System.out.println("Sample shifts and employees loaded into database");
        }
    }
}
