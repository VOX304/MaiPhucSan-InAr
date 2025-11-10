package org.hbrs.ia.model;

import org.bson.Document;
import java.time.LocalDate;

public class SocialPerformanceRecord {
    private String description;
    private LocalDate date;
    private int score; // điểm đánh giá, ví dụ từ 1-10

    public SocialPerformanceRecord(String description, LocalDate date, int score) {
        this.description = description;
        this.date = date;
        this.score = score;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    // Chuyển object sang Document để lưu MongoDB
    public Document toDocument(int salesmanId) {
        Document doc = new Document();
        doc.append("salesmanId", salesmanId); // để liên kết record với Salesman
        doc.append("description", this.description);
        doc.append("date", this.date.toString()); // lưu ngày dưới dạng String
        doc.append("score", this.score);
        return doc;
    }
}
