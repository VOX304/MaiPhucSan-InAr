package org.hbrs.ia.code;

import org.hbrs.ia.model.SalesMan;
import org.hbrs.ia.model.SocialPerformanceRecord;

import java.util.List;

public interface ManagePersonal {

    // CRUD cho SalesMan
    void createSalesMan(SalesMan record);

    SalesMan readSalesMan(int sid);

    List<SalesMan> readAllSalesMen();

    void updateSalesMan(SalesMan record);

    void deleteSalesMan(int sid);

    // CRUD cho SocialPerformanceRecord
    void addSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId);

    List<SocialPerformanceRecord> readSocialPerformanceRecords(int salesmanId);

    void updateSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId);

    void deleteSocialPerformanceRecord(SocialPerformanceRecord record, int salesmanId);
}
