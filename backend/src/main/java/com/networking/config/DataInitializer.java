package com.networking.config;

import com.networking.model.Employee;
import com.networking.model.JobRole;
import com.networking.model.Student;
import com.networking.repository.EmployeeRepository;
import com.networking.repository.JobRoleRepository;
import com.networking.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the H2 in-memory database on every startup.
 * Because H2 resets on each restart, all demo data is recreated here.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository studentRepository;
    private final EmployeeRepository employeeRepository;
    private final JobRoleRepository jobRoleRepository;

    @Override
    public void run(String... args) {

        // ── Students ─────────────────────────────────────────────────────────
        // Students are created via the frontend signup flow only.
        // No seeding here - deleteAll() removed for Supabase pooler compatibility.

        // ── Employees / Mentors ──────────────────────────────────────────────
        if (employeeRepository.count() == 0) {

            employeeRepository.saveAll(List.of(

                Employee.builder()
                    .name("Sarah Mitchell")
                    .jobTitle("Senior Software Engineer")
                    .companyId("comp-1")
                    .companyName("TechCorp Inc.")
                    .bio("10 years in backend engineering. Passionate about mentoring junior developers.")
                    .build(),

                Employee.builder()
                    .name("James Okonkwo")
                    .jobTitle("Head of Product")
                    .companyId("comp-1")
                    .companyName("TechCorp Inc.")
                    .bio("Former startup founder. Now leading product strategy at TechCorp.")
                    .build(),

                Employee.builder()
                    .name("Linda Chen")
                    .jobTitle("Data Science Lead")
                    .companyId("comp-2")
                    .companyName("DataVentures Ltd.")
                    .bio("ML researcher turned industry practitioner. Love finding insights in messy data.")
                    .build(),

                Employee.builder()
                    .name("Ravi Patel")
                    .jobTitle("Engineering Manager")
                    .companyId("comp-2")
                    .companyName("DataVentures Ltd.")
                    .bio("I help engineers grow into tech leads. DM me if you need career advice.")
                    .build(),

                Employee.builder()
                    .name("Emma Roberts")
                    .jobTitle("Legal Tech Specialist")
                    .companyId("comp-3")
                    .companyName("LegalAI Solutions")
                    .bio("Bridging the gap between law and technology. Always looking for sharp minds.")
                    .build()
            ));
        }

        // ── Job Roles ────────────────────────────────────────────────────────
        if (jobRoleRepository.count() == 0) {

            jobRoleRepository.saveAll(List.of(

                JobRole.builder()
                    .title("Junior Backend Developer")
                    .description("Build and maintain scalable REST APIs using Java and Spring Boot. Work closely with the product team.")
                    .companyId("comp-1")
                    .department("Engineering")
                    .requiredSkills(List.of("Java", "Spring Boot", "SQL", "Git", "Problem Solving"))
                    .build(),

                JobRole.builder()
                    .title("Data Science Associate")
                    .description("Develop predictive models and data pipelines. Translate business problems into ML solutions.")
                    .companyId("comp-2")
                    .department("Data Science")
                    .requiredSkills(List.of("Python", "Machine Learning", "SQL", "TensorFlow", "Communication"))
                    .build(),

                JobRole.builder()
                    .title("Legal Technology Analyst")
                    .description("Support digital transformation of legal processes. Research compliance frameworks and implement RegTech tools.")
                    .companyId("comp-3")
                    .department("Legal")
                    .requiredSkills(List.of("Legal Research", "Compliance", "Communication", "Data Privacy", "Policy Analysis"))
                    .build()
            ));
        }

        System.out.println("✅ DataInitializer: Seeded " +
            studentRepository.count() + " students, " +
            employeeRepository.count() + " employees, " +
            jobRoleRepository.count() + " job roles.");
    }
}
