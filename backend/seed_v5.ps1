# Seed Employees (Industry Mentors)
curl.exe -X POST -H "Content-Type: application/json" -d '{"name":"Marcus Aurelius","jobTitle":"Senior AI Engineer","companyId":"comp-1","companyName":"MetaLaw","bio":"Helping students bridge the gap between law and tech."}' http://localhost:8080/api/employees/seed
curl.exe -X POST -H "Content-Type: application/json" -d '{"name":"Elena Fisher","jobTitle":"Product Manager","companyId":"comp-1","companyName":"MetaLaw","bio":"Passionate about UX in legal tech."}' http://localhost:8080/api/employees/seed

# Seed Students
curl.exe -X POST -H "Content-Type: application/json" -d '{"name":"Alex Rivera","email":"alex@example.com","skills":["Java","Spring Boot","React"],"projects":[{"title":"Legal Parser","description":"AI tool for law docs.","link":"github.com/alex/legal"}]}' http://localhost:8080/api/candidates/seed
curl.exe -X POST -H "Content-Type: application/json" -d '{"name":"Sarah Chen","email":"sarah@example.com","skills":["Python","TensorFlow"],"projects":[{"title":"LawBot","description":"Discord bot for legal advice.","link":"github.com/sarah/lawbot"}]}' http://localhost:8080/api/candidates/seed

# Seed Role
curl.exe -X POST -H "Content-Type: application/json" -d '{"title":"AI Legal Analyst","description":"Seeking talent at the intersection of NLP and Law.","companyId":"comp-1","requiredSkills":["Python","NLP","Java"]}' http://localhost:8080/api/candidates/role/seed
