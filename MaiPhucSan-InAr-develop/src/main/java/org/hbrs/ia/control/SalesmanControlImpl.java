package org.hbrs.ia.control;

import com.mongodb.client.*;
import org.bson.Document;
import org.hbrs.ia.model.SalesMan;

import java.util.ArrayList;
import java.util.List;

public class SalesmanControlImpl {

    private final MongoClient mongoClient;
    private final MongoDatabase database;
    private final MongoCollection<Document> salesmanCollection;

    // Constructor: kết nối MongoDB
    public SalesmanControlImpl() {
        mongoClient = MongoClients.create("mongodb://localhost:27017");
        database = mongoClient.getDatabase("MyDB");
        salesmanCollection = database.getCollection("salesmen");
    }

    //-------------------------------- Salesman CRUD operations --------------------------------//

    // Thêm Salesman
    public void addSalesman(SalesMan s) {
        Document doc = s.toDocument(); // dùng phương thức toDocument() của SalesMan
        salesmanCollection.insertOne(doc);
    }

    // Lấy tất cả Salesmen
    public List<SalesMan> getAllSalesmen() {
        List<SalesMan> list = new ArrayList<>();
        FindIterable<Document> docs = salesmanCollection.find();
        for (Document doc : docs) {
            SalesMan s = new SalesMan(
                    doc.getString("firstname"),
                    doc.getString("lastname"),
                    doc.getInteger("sid")
            );
            list.add(s);
        }
        return list;
    }

    // Xoá Salesman theo ID
    public void deleteSalesmanById(int id) {
        salesmanCollection.deleteOne(new Document("sid", id));
    }

    // Đóng kết nối MongoDB
    public void close() {
        mongoClient.close();
    }
}
