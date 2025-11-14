package com.prodapt.flowable.config;

import java.util.Arrays;

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
        if ( employeeRepository.count() == 0) {
            Employee emp1 = new Employee();
            emp1.setAttUid("john.doe");
            emp1.setEmail("john.doe@att.com");
            emp1.setRole("DTAC");
            emp1.setFirstName("John");
            emp1.setLastName("Doe");
            emp1.setActive(true);

            Employee emp2 = new Employee();
            emp2.setAttUid("jane.smith");
            emp2.setEmail("jane.smith@att.com");
            emp2.setRole("DTAC");
            emp2.setFirstName("Jane");
            emp2.setLastName("Smith");
            emp2.setActive(true);

            Employee emp3 = new Employee();
            emp3.setAttUid("bob.johnson");
            emp3.setEmail("bob.johnson@att.com");
            emp3.setRole("Analyst");
            emp3.setFirstName("Bob");
            emp3.setLastName("Johnson");
            emp3.setActive(true);

            Employee emp4 = new Employee();
            emp4.setAttUid("alice.brown");
            emp4.setEmail("alice.brown@att.com");
            emp4.setRole("DTAC");
            emp4.setFirstName("Alice");
            emp4.setLastName("Brown");
            emp4.setActive(true);

            Employee emp5 = new Employee();
            emp5.setAttUid("chris.wilson");
            emp5.setEmail("chris.wilson@att.com");
            emp5.setRole("DTAC");
            emp5.setFirstName("Chris");
            emp5.setLastName("Wilson");
            emp5.setActive(true);
            
            Employee emp6 = new Employee();
            emp6.setAttUid("david.lee");
            emp6.setEmail("david.lee@att.com");
            emp6.setRole("DTAC");
            emp6.setFirstName("David");
            emp6.setLastName("Lee");
            emp6.setActive(true);

            employeeRepository.saveAll(Arrays.asList(emp1, emp2, emp3, emp4, emp5, emp6));
            System.out.println("Sample shifts and employees loaded into database");
        }
    }
}
