package com.networking.repository;

import com.networking.model.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRoleRepository extends JpaRepository<JobRole, Long> {
    List<JobRole> findByCompanyId(String companyId);
}
