package com.networking.dto;

import com.networking.model.Interaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InteractionActivity {
    private Interaction interaction;
    private String studentName;
    private String employeeName;
}
