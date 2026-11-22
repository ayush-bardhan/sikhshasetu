package com.shikshasetu.repo;

import com.shikshasetu.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByStudentCodeIgnoreCase(String studentCode);
    boolean existsByStudentCodeIgnoreCase(String studentCode);
}
