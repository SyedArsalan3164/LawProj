package com.networking.controller;

import com.networking.dto.StudentMatchResult;
import com.networking.model.Interaction;
import com.networking.model.JobRole;
import com.networking.model.Student;
import com.networking.repository.InteractionRepository;
import com.networking.repository.JobRoleRepository;
import com.networking.repository.StudentRepository;
import com.networking.service.AIService;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CandidateMatchController {

    private final AIService aiService;
    private final StudentRepository studentRepository;
    private final JobRoleRepository jobRoleRepository;
    private final InteractionRepository interactionRepository;

    /* ── AI Ranking for a role ────────────────────────────────────────────── */

    @GetMapping("/match/{roleId}")
    public List<StudentMatchResult> getMatchesForRole(@PathVariable Long roleId) {
        JobRole role = jobRoleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("Job role not found"));

        return studentRepository.findAll().stream()
                .map(student -> {
                    List<Interaction> studentInteractions = interactionRepository.findAll().stream()
                            .filter(i -> i.getSenderId().equals(student.getId().toString())
                                      || i.getReceiverId().equals(student.getId().toString()))
                            .collect(Collectors.toList());

                    StudentMatchResult result = aiService.analyzeStudentFit(student, role, studentInteractions);
                    result.setVerificationStatus(student.getVerificationStatus().name());
                    return result;
                })
                .sorted(Comparator.comparingDouble(StudentMatchResult::getMatchPercentage).reversed())
                .collect(Collectors.toList());
    }

    /* ── AI Rank a single student against all available roles ─────────────── */

    @GetMapping("/ai-rank/{studentId}")
    public ResponseEntity<Map<String, Object>> rankStudent(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Interaction> interactions = interactionRepository.findAll().stream()
                .filter(i -> i.getSenderId().equals(studentId.toString())
                          || i.getReceiverId().equals(studentId.toString()))
                .collect(Collectors.toList());

        // Use the first available job role, or a synthetic default
        JobRole role = jobRoleRepository.findAll().stream().findFirst()
                .orElseGet(() -> {
                    JobRole r = new JobRole();
                    r.setTitle("General Professional Role");
                    r.setRequiredSkills(List.of("Java", "Python", "Communication", "Leadership", "Problem Solving"));
                    return r;
                });

        StudentMatchResult result = aiService.analyzeStudentFit(student, role, interactions);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("studentId",            result.getStudentId());
        response.put("studentName",          result.getStudentName());
        response.put("matchPercentage",      Math.round(result.getMatchPercentage() * 10.0) / 10.0);
        response.put("roleName",             role.getTitle());
        response.put("identifiedCapabilities", result.getIdentifiedCapabilities());
        response.put("aiReasoning",          result.getAiReasoning());
        response.put("breakdown", Map.of(
            "resumeUploaded", student.getResumeText() != null && !student.getResumeText().isBlank(),
            "skillsCount",    student.getSkills() != null ? student.getSkills().size() : 0,
            "interactionCount", interactions.size()
        ));

        return ResponseEntity.ok(response);
    }

    /* ── PDF Resume Upload ────────────────────────────────────────────────── */

    @PostMapping(value = "/student/upload-resume/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadResume(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }
        if (!Objects.requireNonNull(file.getOriginalFilename()).toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only PDF files are accepted"));
        }

        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(doc).trim();

            student.setResumeText(extractedText);
            studentRepository.save(student);

            // Immediately run AI analysis so frontend gets fresh score
            List<Interaction> interactions = interactionRepository.findAll().stream()
                    .filter(i -> i.getSenderId().equals(id.toString())
                              || i.getReceiverId().equals(id.toString()))
                    .collect(Collectors.toList());

            JobRole role = jobRoleRepository.findAll().stream().findFirst()
                    .orElseGet(() -> {
                        JobRole r = new JobRole();
                        r.setTitle("General Professional Role");
                        r.setRequiredSkills(List.of("Java", "Python", "Communication", "Leadership"));
                        return r;
                    });

            StudentMatchResult result = aiService.analyzeStudentFit(student, role, interactions);

            return ResponseEntity.ok(Map.of(
                "message",       "Resume uploaded and analysed successfully",
                "wordCount",     extractedText.split("\\s+").length,
                "matchPercentage", Math.round(result.getMatchPercentage() * 10.0) / 10.0,
                "capabilities",  result.getIdentifiedCapabilities(),
                "reasoning",     result.getAiReasoning()
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to parse PDF: " + e.getMessage()));
        }
    }

    /* ── CRUD Endpoints ──────────────────────────────────────────────────── */

    @PostMapping("/verify/{studentId}")
    public Student verifyStudent(@PathVariable Long studentId, @RequestParam String status) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setVerificationStatus(Student.VerificationStatus.valueOf(status.toUpperCase()));
        return studentRepository.save(student);
    }

    @GetMapping("/students")
    public List<Student> getAllStudents() { return studentRepository.findAll(); }

    @GetMapping("/student/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping("/student/update/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setName(studentDetails.getName());
        student.setSkills(studentDetails.getSkills());
        student.setProjects(studentDetails.getProjects());
        student.setGithubUrl(studentDetails.getGithubUrl());
        student.setResumeText(studentDetails.getResumeText());
        return studentRepository.save(student);
    }

    @GetMapping("/roles")
    public List<JobRole> getAllRoles() { return jobRoleRepository.findAll(); }

    @PostMapping("/student/login")
    public ResponseEntity<?> loginStudent(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password required"));
        }

        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            // Basic password check
            if (password.equals(student.getPassword())) {
                return ResponseEntity.ok(student);
            }
        }
        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }

    @PostMapping("/student/seed")
    public Student seedStudent(@RequestBody Student student) { return studentRepository.save(student); }

    @PostMapping("/role/seed")
    public JobRole seedRole(@RequestBody JobRole role) { return jobRoleRepository.save(role); }
}
