from pydantic import BaseModel


class Contact(BaseModel):
    phone: str
    email: str


class Education(BaseModel):
    institution: str
    degree: str | None = None
    cgpa: float | None = None
    start_year: int | None = None
    graduation_year: int | None = None
    class_xii: dict | None = None
    class_x: dict | None = None


class Skills(BaseModel):
    languages: list[str]
    full_stack: list[str]
    databases: list[str]
    ai_and_llm: list[str]
    testing: list[str]
    tools: list[str]
    computer_science: list[str]


class Experience(BaseModel):
    company: str
    role: str
    start: str
    end: str
    responsibilities: list[str]


class Project(BaseModel):
    name: str
    technologies: list[str]
    details: list[str]


class Certification(BaseModel):
    name: str
    organization: str
    date: str


class Achievement(BaseModel):
    title: str
    organization: str | None = None
    details: list[str]


class SocialLinks(BaseModel):
    github: str
    linkedin: str
    portfolio: str


class Candidate(BaseModel):
    name: str
    contact: Contact
    summary: str
    education: list[Education]
    skills: Skills
    experience: list[Experience]
    projects: list[Project]
    certifications: list[Certification]
    achievements: list[Achievement]
   