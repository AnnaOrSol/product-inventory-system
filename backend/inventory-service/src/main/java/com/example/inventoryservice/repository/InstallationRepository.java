package com.example.inventoryservice.repository;

import com.example.inventoryservice.model.Installation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface InstallationRepository extends JpaRepository<Installation, UUID> {

}
