package com.lifemate.backend.model;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@Document(collection = "holiday_leaves")
public class HolidayLeave {

    @Id
    private String id;

    @Indexed
    private String userEmail;

    private String date;  // YYYY-MM-DD
    private String type;  // "HOLIDAY" | "LEAVE"
    private String note;
}
