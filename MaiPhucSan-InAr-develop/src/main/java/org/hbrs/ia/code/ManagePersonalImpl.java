package org.hbrs.ia.code;

import com.mongodb.client.*;
import com.mongodb.client.model.Filters;
import org.bson.Document;
import org.hbrs.ia.model.SalesMan;
import org.hbrs.ia.model.SocialPerformanceRecord;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class ManagePersonalImpl implements ManagePersonal {

    private final MongoClient mongoClient;
    private final MongoDatabase database;
    private final MongoCollection<Document> salesmenCollection;
    private final MongoCollection<Document> performanceCollection;

    public ManagePersonalImpl() {
        mongoClient = MongoClients.create("mongodb://localhost:27017");
        database = mongoClient.getDatabase("MyDB");
        salesmenCollection = database.getCollection("salesmen");
        performanceCollection = database.getCollection("socialPerformance");
    }

    //----------------- SalesMan CRUD -----------------//
    @Override
    public void createSalesMan(SalesMan record) {
        salesmenCollection.insertOne(record.toDocument());
    }

    @Override
    public SalesMan readSalesMan(int sid) {
        Document doc = salesmenCollection.find(Filters.eq("sid", sid)).first();
        if (doc != null) {
            return new SalesMan(doc.getString("firstname"), doc.getString("lastname"), doc.getInteger("sid"));
        }
        return null;
    }

    @Override
    public List<SalesMan> readAllSalesMen() {
        List<SalesMan> list = new ArrayList<>();
        for (Document doc : salesmenCollection.find()) {
            list.add(new SalesMan(doc.getString("firstname"), doc.getString("lastname"), doc.getInteger("sid")));
        }
        return list;
    }

    @Override
    public void updateSalesMan(SalesMan record) {
        salesmenCollection.updateOne(
            Filters.eq("sid", record.getId()),
            new Document("$set", new Document("firstname", record.getFirstname())
                                     .append("lastname", record.getLastname()))
        );
    }

    @Override
    public void deleteSalesMan(int sid) {
        salesmenCollection.deleteOne(Filters.eq("sid", sid));
        // Đồng thời xóa luôn các social performance record liên quan
        performanceCollection.deleteMany(Filters.eq("salesmanId", sid));
    }

    //----------------- SocialPerformanceRecord CRUD -----------------//
    @Override
    public void addSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId) {
        // gọi đúng toDocument với salesmanId
        performanceCollection.insertOne(record.toDocument(salesmanId));
    }

    @Override
    public List<SocialPerformanceRecord> readSocialPerformanceRecords(int salesmanId) {
        List<SocialPerformanceRecord> list = new ArrayList<>();
        for (Document doc : performanceCollection.find(Filters.eq("salesmanId", salesmanId))) {
            String description = doc.getString("description");
            LocalDate date = LocalDate.parse(doc.getString("date")); // chuyển từ String về LocalDate
            int score = doc.getInteger("score");
            list.add(new SocialPerformanceRecord(description, date, score));
        }
        return list;
    }

    @Override
    public void updateSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId) {
        performanceCollection.updateOne(
            Filters.and(
                Filters.eq("salesmanId", salesmanId),
                Filters.eq("date", record.getDate().toString())
            ),
            new Document("$set", new Document("description", record.getDescription())
                                    .append("score", record.getScore()))
        );
    }

    @Override
    public void deleteSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId) {
        performanceCollection.deleteOne(
            Filters.and(
                Filters.eq("salesmanId", salesmanId),
                Filters.eq("date", record.getDate().toString())
            )
        );
    }

    //----------------- Close connection -----------------//
    public void close() {
        mongoClient.close();
    }
}
