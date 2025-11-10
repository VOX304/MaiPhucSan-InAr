package org.hbrs.ia.main;

import org.hbrs.ia.code.ManagePersonalImpl;
import org.hbrs.ia.model.SalesMan;
import org.hbrs.ia.model.SocialPerformanceRecord;

import java.time.LocalDate;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ManagePersonalImpl manager = new ManagePersonalImpl();

        try {
            // ----------------- SalesMan Demo ----------------- //
            SalesMan s1 = new SalesMan("John", "Doe", 1);
            SalesMan s2 = new SalesMan("Alice", "Smith", 2);

            manager.createSalesMan(s1);
            manager.createSalesMan(s2);

            System.out.println("All Salesmen after addition:");
            List<SalesMan> allSalesmen = manager.readAllSalesMen();
            for (SalesMan s : allSalesmen) {
                System.out.println("ID: " + s.getId() + ", Name: " + s.getFirstname() + " " + s.getLastname());
            }

            // Update SalesMan
            s2.setLastname("Johnson");
            manager.updateSalesMan(s2);
            System.out.println("\nAfter updating Alice's lastname:");
            for (SalesMan s : manager.readAllSalesMen()) {
                System.out.println("ID: " + s.getId() + ", Name: " + s.getFirstname() + " " + s.getLastname());
            }

            // Delete SalesMan
            manager.deleteSalesMan(1);
            System.out.println("\nAfter deleting Salesman with ID 1:");
            for (SalesMan s : manager.readAllSalesMen()) {
                System.out.println("ID: " + s.getId() + ", Name: " + s.getFirstname() + " " + s.getLastname());
            }

            // ----------------- SocialPerformanceRecord Demo ----------------- //
            SocialPerformanceRecord sp1 = new SocialPerformanceRecord("Great teamwork", LocalDate.of(2025, 10, 19), 9);
            SocialPerformanceRecord sp2 = new SocialPerformanceRecord("Excellent client feedback", LocalDate.of(2025, 10, 20), 10);

            manager.addSocialPerformanceRecord(sp1, 2);
            manager.addSocialPerformanceRecord(sp2, 2);

            System.out.println("\nSocial Performance Records for Salesman ID 2:");
            List<SocialPerformanceRecord> records = manager.readSocialPerformanceRecords(2);
            for (SocialPerformanceRecord r : records) {
                System.out.println(r.getDate() + " - " + r.getDescription() + " - Score: " + r.getScore());
            }

            // Update SocialPerformanceRecord
            sp1.setScore(10);
            manager.updateSocialPerformanceRecord(sp1, 2);
            System.out.println("\nAfter updating score for 2025-10-19:");
            records = manager.readSocialPerformanceRecords(2);
            for (SocialPerformanceRecord r : records) {
                System.out.println(r.getDate() + " - " + r.getDescription() + " - Score: " + r.getScore());
            }

            // Delete SocialPerformanceRecord
            manager.deleteSocialPerformanceRecord(sp2, 2);
            System.out.println("\nAfter deleting record for 2025-10-20:");
            records = manager.readSocialPerformanceRecords(2);
            for (SocialPerformanceRecord r : records) {
                System.out.println(r.getDate() + " - " + r.getDescription() + " - Score: " + r.getScore());
            }

        } finally {
            manager.close();
            System.out.println("\nMongoDB connection closed.");
        }
    }
}
