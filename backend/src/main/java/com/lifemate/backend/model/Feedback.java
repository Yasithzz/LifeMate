package com.lifemate.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "feedbacks")
public class Feedback {

    @Id
    private String id;
    private String userEmail;
    private String userName;
    private String message;
    private int rating;
    private Instant createdAt = Instant.now();

    public String getId()          { return id; }
    public String getUserEmail()   { return userEmail; }
    public String getUserName()    { return userName; }
    public String getMessage()     { return message; }
    public int    getRating()      { return rating; }
    public Instant getCreatedAt()  { return createdAt; }

    public void setId(String id)               { this.id = id; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public void setUserName(String userName)   { this.userName = userName; }
    public void setMessage(String message)     { this.message = message; }
    public void setRating(int rating)          { this.rating = rating; }
    public void setCreatedAt(Instant createdAt){ this.createdAt = createdAt; }
}
