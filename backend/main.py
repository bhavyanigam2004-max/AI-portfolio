import os
import json

from dotenv import load_dotenv
from fastapi import FastAPI,Body
from fastapi.responses import StreamingResponse
from groq import Groq
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing")

client = Groq(api_key=api_key)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "https://ai-portfolio-seven-alpha.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Load candidate data
with open("data/candidate.json", "r", encoding="utf-8") as file:
    candidate_data = json.load(file)


system_prompt = f"""
You are an AI representative of Bhavya Nigam.

Your job is to answer questions about Bhavya professionally and honestly.

Rules:
1. Only use the candidate information provided below.
2. Never invent or assume information.
3. If the information is not available, clearly say that you don't have that information.
4. Do not make up skills, experience, projects, achievements, job offers, or personal details.
5. Keep answers clear, concise, and professional.
6. When discussing Bhavya's projects or experience, explain them based only on the provided candidate information.
7. Do not use Markdown tables. Use headings and bullet points instead.
8. Do not use HTML tags such as <br>. Use normal sentences and Markdown line breaks.

Candidate Information:
{json.dumps(candidate_data, indent=2)}
"""


@app.get("/")
def home():
    return {"message": "AI Portfolio Backend is running"}




@app.post("/chat")
def chat(
    question: str = Body(..., embed=True),
    history: list = Body(default=[])
):
    
    formatted_history = []

    for message in history:
        formatted_history.append({
            "role": "user" if message["sender"] == "user" else "assistant",
            "content": message["text"]
        })

    messages = [
        {
            "role": "system",
            "content": system_prompt
        },
        *formatted_history,
        {
            "role": "user",
            "content": question
        }
    ]

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=messages,
        stream=True
    )

    def generate():
        for chunk in response:
            content = chunk.choices[0].delta.content or ""

            if content:
                yield content

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    )

@app.post("/match-job")
def match_job(
    job_description: str = Body(..., embed=True)
):
    prompt = f"""
You are evaluating how well Bhavya Nigam matches a job description.

Candidate Information:
{json.dumps(candidate_data, indent=2)}

Job Description:
{job_description}

Analyze the match based ONLY on the candidate information.

Return the result in exactly this JSON structure:

{{
  "match_percentage": 0,
  "matching_skills": [],
  "relevant_projects_experience": [],
  "missing_or_weak_skills": [],
  "assessment": ""
}}

Rules:
- match_percentage must be a number between 0 and 100.
- matching_skills must contain the candidate skills that match the job description.
- relevant_projects_experience must contain relevant projects or work experience from the candidate profile.
- missing_or_weak_skills must contain skills required by the job description that are missing or weak in the candidate profile.
- assessment must contain a short 2-4 sentence overall assessment.
- Do not leave relevant_projects_experience empty if the candidate has relevant projects or experience.
- Do not leave assessment empty.
- Use ONLY the provided candidate information.
- Do not invent any information.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
   messages=[
    {
        "role": "system",
        "content": "You are a professional job matching assistant. Use only the provided candidate information. Return the result as valid JSON."
    },
    {
        "role": "user",
        "content": prompt
    }
],
        response_format={"type": "json_object"}
    )

    return {
        "result": response.choices[0].message.content
    }