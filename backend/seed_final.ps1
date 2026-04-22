$employees = @(
    @{ id=101; name="Marcus Aurelius"; jobTitle="Senior AI Engineer"; companyId="comp-1"; companyName="MetaLaw"; bio="Helping students bridge the gap between law and tech." },
    @{ id=102; name="Elena Fisher"; jobTitle="Product Manager"; companyId="comp-1"; companyName="MetaLaw"; bio="Passionate about UX in legal tech." }
)

$students = @(
    @{ id=1; name="Alex Rivera"; email="alex@example.com"; skills=@("Java","Spring Boot","React"); projects=@(@{title="Legal Parser"; description="AI tool for law docs."; link="github.com/alex/legal"}) },
    @{ id=2; name="Sarah Chen"; email="sarah@example.com"; skills=@("Python","TensorFlow"); projects=@(@{title="LawBot"; description="Discord bot for legal advice."; link="github.com/sarah/lawbot"}) }
)

$role = @{ id=1; title="AI Legal Analyst"; description="Seeking talent at the intersection of NLP and Law."; companyId="comp-1"; requiredSkills=@("Python","NLP","Java") }

foreach ($e in $employees) {
    Invoke-RestMethod -Uri "http://localhost:8080/api/employees/seed" -Method Post -Body ($e | ConvertTo-Json) -ContentType "application/json"
}

foreach ($s in $students) {
    Invoke-RestMethod -Uri "http://localhost:8080/api/candidates/student/seed" -Method Post -Body ($s | ConvertTo-Json -Depth 5) -ContentType "application/json"
}

Invoke-RestMethod -Uri "http://localhost:8080/api/candidates/role/seed" -Method Post -Body ($role | ConvertTo-Json) -ContentType "application/json"
