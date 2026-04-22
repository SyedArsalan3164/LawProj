package com.networking.config;

import com.networking.model.Employee;
import com.networking.model.JobRole;
import com.networking.model.Project;
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
        if (studentRepository.count() == 0) {

            studentRepository.saveAll(List.of(

                Student.builder()
                    .name("Aisha Khan")
                    .email("aisha@demo.com")
                    .password("demo123")
                    .skills(List.of("Java", "Spring Boot", "SQL", "Git"))
                    .githubUrl("https://github.com/aishakhan")
                    .resumeText("Aisha Khan - Software Developer\n\nExperience:\n- Developed REST APIs using Spring Boot at internship\n- Built and deployed microservices with Docker\n- Led a team of 3 students for final year project\n- Won best project award at university hackathon\n\nSkills: Java, Spring Boot, SQL, Git, Problem Solving\n\nProjects: E-commerce backend, Student Portal API")
                    .projects(List.of(
                        Project.builder().title("E-Commerce Backend").description("REST API for an online store using Spring Boot and MySQL").build(),
                        Project.builder().title("Student Portal").description("University management system with role-based access control").build()
                    ))
                    .build(),

                Student.builder()
                    .name("Bilal Raza")
                    .email("bilal@demo.com")
                    .password("demo123")
                    .skills(List.of("Python", "Machine Learning", "SQL", "TensorFlow"))
                    .githubUrl("https://github.com/bilalraza")
                    .resumeText("Bilal Raza - Data Science Enthusiast\n\nSummary:\nPassionate about machine learning and data-driven decisions. Published research paper on sentiment analysis. Ranked top 5% in national coding competition.\n\nExperience:\n- Implemented ML models for churn prediction\n- Designed data pipelines processing 1M+ records\n- Collaborated with cross-functional teams\n\nSkills: Python, Machine Learning, TensorFlow, SQL, Communication")
                    .projects(List.of(
                        Project.builder().title("Churn Prediction Model").description("ML model achieving 87% accuracy using XGBoost").build(),
                        Project.builder().title("Sentiment Analyzer").description("NLP pipeline for Twitter data analysis, published in conference").build()
                    ))
                    .build(),

                Student.builder()
                    .name("Sara Ahmed")
                    .email("sara@demo.com")
                    .password("demo123")
                    .skills(List.of("Legal Research", "Compliance", "Communication", "Policy Analysis"))
                    .resumeText("Sara Ahmed - Legal Technology\n\nEducation: LLB with Distinction\n\nExperience:\n- Researched compliance frameworks for FinTech startups\n- Drafted regulatory policy documents for data privacy\n- Negotiated contracts and reviewed legal agreements\n- Mentored junior law students as team captain\n\nSkills: Legal Research, Compliance, Data Privacy, Communication, Policy Analysis")
                    .projects(List.of(
                        Project.builder().title("GDPR Compliance Toolkit").description("Open-source checklist for startups navigating EU data regulations").build()
                    ))
                    .build()
            ));
        }

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
