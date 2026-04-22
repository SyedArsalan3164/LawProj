# Seed Student 1: Alex Rivera
$student1 = @'
{
  "name": "Alex Rivera",
  "email": "alex@example.com",
  "skills": ["Java", "Spring Boot", "React", "Docker"],
  "projects": [
    { "title": "Microservices Architecture", "description": "Built a scalable microservices system using Spring Cloud.", "link": "github.com/alex/micro" },
    { "title": "Real-time Chat", "description": "A socket-based chat application with React.", "link": "github.com/alex/chat" }
  ],
  "appliedJobRoleIds": ["1", "2"]
}
'@
$student1 | Out-File -Encoding utf8 student1.json
curl.exe -X POST http://localhost:8080/api/candidates/student/seed -H "Content-Type: application/json" -d "@student1.json"

# Seed Student 2: Sarah Chen
$student2 = @'
{
  "name": "Sarah Chen",
  "email": "sarah@example.com",
  "skills": ["React", "CSS", "TypeScript", "Node.js"],
  "projects": [
    { "title": "Portfolio CMS", "description": "A custom CMS for designers.", "link": "github.com/sarah/cms" }
  ],
  "appliedJobRoleIds": ["1"]
}
'@
$student2 | Out-File -Encoding utf8 student2.json
curl.exe -X POST http://localhost:8080/api/candidates/student/seed -H "Content-Type: application/json" -d "@student2.json"

# Seed Role
$role1 = @'
{
  "title": "Backend Software Engineer",
  "description": "Looking for a student who knows Java and Spring Boot.",
  "companyId": "comp-1",
  "requiredSkills": ["Java", "Spring Boot"],
  "department": "Engineering"
}
'@
$role1 | Out-File -Encoding utf8 role1.json
curl.exe -X POST http://localhost:8080/api/candidates/role/seed -H "Content-Type: application/json" -d "@role1.json"
