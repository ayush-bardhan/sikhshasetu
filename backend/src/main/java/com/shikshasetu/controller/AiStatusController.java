package com.shikshasetu.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.time.Instant;
import java.util.Map;

/** Describes which AI capabilities are actually connected in this release. */
@RestController
public class AiStatusController {

    @GetMapping("/api/ai/status")
    public Map<String, Object> status() {
        return Map.of(
            "platformAdministrator", "AI_SYSTEM_CAPABILITY",
            "riskEngine", "RULE_BASED_DEMONSTRATION",
            "trainedModel", "NOT_CONNECTED",
            "studentChatbot", "FRONTEND_PREVIEW_ONLY",
            "manualInterpretations", "SPRING_BOOT_AND_H2_PERSISTED",
            "timestamp", Instant.now().toString(),
            "notice", "No trained AI model or conversational model is connected. Human review remains required."
        );
    }
}
