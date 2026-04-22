package com.networking.repository;

import com.networking.model.Interaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InteractionRepository extends JpaRepository<Interaction, Long> {
    List<Interaction> findByCompanyId(String companyId);
    List<Interaction> findByJobPostId(String jobPostId);

    @Query("SELECT i FROM Interaction i WHERE (i.senderId = :id1 AND i.receiverId = :id2) OR (i.senderId = :id2 AND i.receiverId = :id1) ORDER BY i.timestamp ASC")
    List<Interaction> findChatHistory(String id1, String id2);
}
