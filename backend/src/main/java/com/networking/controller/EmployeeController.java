package com.networking.controller;

import com.networking.model.Employee;
import com.networking.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {
    private final EmployeeRepository repository;

    @GetMapping
    public List<Employee> getAllEmployees() {
        return repository.findAll();
    }

    @PostMapping("/seed")
    public Employee seedEmployee(@RequestBody Employee employee) {
        return repository.save(employee);
    }
}
