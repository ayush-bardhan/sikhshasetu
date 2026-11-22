package com.shikshasetu.controller;

import com.shikshasetu.dto.EarlyWarningView;
import com.shikshasetu.dto.RiskAssessmentView;
import com.shikshasetu.model.Student;
import com.shikshasetu.repo.AcademicRecordRepository;
import com.shikshasetu.repo.AiAssessmentRepository;
import com.shikshasetu.repo.MentorFeedbackRepository;
import com.shikshasetu.repo.ManualInterpretationRepository;
import com.shikshasetu.repo.RiskAssessmentRepository;
import com.shikshasetu.repo.StudentRepository;
import com.shikshasetu.service.RiskService;
import com.shikshasetu.service.StudentTrendService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository students;
    private final RiskService riskService;
    private final StudentTrendService trendService;
    private final AcademicRecordRepository academicRecords;
    private final RiskAssessmentRepository riskAssessments;
    private final MentorFeedbackRepository mentorFeedback;
    private final ManualInterpretationRepository manualInterpretations;
    private final AiAssessmentRepository aiAssessments;

    public StudentController(
        StudentRepository students,
        RiskService riskService,
        StudentTrendService trendService,
        AcademicRecordRepository academicRecords,
        RiskAssessmentRepository riskAssessments,
        MentorFeedbackRepository mentorFeedback,
        ManualInterpretationRepository manualInterpretations,
        AiAssessmentRepository aiAssessments
    ) {
        this.students = students;
        this.riskService = riskService;
        this.trendService = trendService;
        this.academicRecords = academicRecords;
        this.riskAssessments = riskAssessments;
        this.mentorFeedback = mentorFeedback;
        this.manualInterpretations = manualInterpretations;
        this.aiAssessments = aiAssessments;
    }

    @PostMapping
    @Transactional
    public Student create(@Valid @RequestBody Student student) {
        student.setId(null);
        String code = student.getStudentCode() == null ? "" : student.getStudentCode().trim();
        if (students.existsByStudentCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("A student with this Student ID already exists");
        }
        student.setStudentCode(code);
        return students.save(student);
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<Student> all() {
        return students.findAll(Sort.by(Sort.Direction.ASC, "fullName"));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public Student one(@PathVariable Long id) {
        return requireStudent(id);
    }

    @PutMapping("/{id}")
    @Transactional
    public Student update(@PathVariable Long id, @Valid @RequestBody Student body) {
        Student current = requireStudent(id);
        String requestedCode = body.getStudentCode() == null ? "" : body.getStudentCode().trim();

        students.findByStudentCodeIgnoreCase(requestedCode).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new IllegalArgumentException("A different student already uses this Student ID");
            }
        });

        current.setStudentCode(requestedCode);
        current.setFullName(body.getFullName());
        current.setEmail(body.getEmail());
        current.setAttendance(body.getAttendance());
        current.setInternalMarks(body.getInternalMarks());
        current.setAssignmentsCompleted(body.getAssignmentsCompleted());
        current.setPreviousFailures(body.getPreviousFailures());
        current.setAbsences(body.getAbsences());
        current.setAuditGroup(body.getAuditGroup());

        return students.save(current);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public Map<String, String> delete(@PathVariable Long id) {
        Student student = requireStudent(id);
        // Delete dependent snapshots and notes before deleting the student.
        academicRecords.deleteByStudentId(id);
        riskAssessments.deleteByStudentId(id);
        mentorFeedback.deleteByStudentId(id);
        manualInterpretations.deleteByStudentId(id);
        aiAssessments.deleteByStudentId(id);
        students.delete(student);
        return Map.of("message", "Student and associated records deleted");
    }

    @PostMapping("/{id}/assess")
    public RiskAssessmentView assess(@PathVariable Long id) {
        return riskService.assess(id);
    }

    @GetMapping("/{id}/risk-history")
    public List<RiskAssessmentView> riskHistory(@PathVariable Long id) {
        return riskService.history(id);
    }

    @GetMapping("/{id}/early-warnings")
    public List<EarlyWarningView> earlyWarnings(@PathVariable Long id) {
        requireStudent(id);
        return trendService.findWarnings(id);
    }

    private Student requireStudent(Long id) {
        return students.findById(id)
            .orElseThrow(() -> new NoSuchElementException("Student not found"));
    }
}
