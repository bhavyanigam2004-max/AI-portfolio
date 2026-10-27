import os
import json
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise ValueError("GROQ_API_KEY is missing")

client = Groq(api_key=api_key)

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

Candidate Information:
{json.dumps(candidate_data, indent=2)}
"""

response = client.chat.completions.create(
    model="openai/gpt-oss-120b",
    messages=[
        {
            "role": "system",
            "content": system_prompt
        },
        {
            "role": "user",
            "content": "Which company did Bhavya work at before Genospark?"
        }
    ]
)

print(response.choices[0].message.content)