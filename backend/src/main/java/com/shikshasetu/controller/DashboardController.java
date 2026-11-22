package com.shikshasetu.controller;
import com.shikshasetu.model.*;
import com.shikshasetu.repo.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.*;
@RestController @RequestMapping("/api/dashboard")
public class DashboardController {
 private final StudentRepository students; private final RiskAssessmentRepository risks;
 public DashboardController(StudentRepository s,RiskAssessmentRepository r){students=s;risks=r;}
 @GetMapping public Map<String,Object> summary(){
  List<Student> all=students.findAll(); Map<Long,RiskAssessment> latest=new HashMap<>();
  for(RiskAssessment r:risks.findAllByOrderByAssessedAtDesc())latest.putIfAbsent(r.getStudentId(),r);
  long high=latest.values().stream().filter(r->"HIGH".equals(r.getRiskBand())).count();
  long medium=latest.values().stream().filter(r->"MEDIUM".equals(r.getRiskBand())).count();
  long low=latest.values().stream().filter(r->"LOW".equals(r.getRiskBand())).count();
  return Map.of("totalStudents",all.size(),"assessedStudents",latest.size(),"highRisk",high,"mediumRisk",medium,"lowRisk",low,
   "unassessedStudents",Math.max(0,all.size()-latest.size()));
 }
 @GetMapping("/risk-bands") public Map<String,Long> bands(){
  Map<String,Long> out=new LinkedHashMap<>();out.put("HIGH",0L);out.put("MEDIUM",0L);out.put("LOW",0L);
  Map<Long,RiskAssessment> latest=new HashMap<>();
  for(RiskAssessment r:risks.findAllByOrderByAssessedAtDesc())latest.putIfAbsent(r.getStudentId(),r);
  latest.values().forEach(r->out.compute(r.getRiskBand(),(k,v)->v==null?1L:v+1));return out;
 }
}
