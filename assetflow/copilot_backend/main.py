import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

app = FastAPI(title="AssetFlow AI Copilot API")

# Configure CORS so the React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExplainRequest(BaseModel):
    page: str
    data: dict

OLLAMA_MODEL = "llama3.1:8b"

SYSTEM_INSTRUCTION = """You are the AssetFlow AI Copilot, an expert Chief Operations Officer and Data Analyst.
Your goal is to summarize and explain application statistics and KPIs in plain, human-readable English.
You will receive context about the current page the user is viewing, along with raw JSON data representing the live database statistics.

RULES:
1. Provide a concise, highly readable summary of the data.
2. Highlight key operational insights (e.g., if there are many pending maintenance tickets, point it out as a bottleneck).
3. Do NOT simply read the JSON back to the user. Interpret it. For example, instead of saying 'total_assets is 10 and available is 8', say 'You currently manage 10 assets, with 8 readily available for allocation.'
4. Keep the tone professional, helpful, and executive.
5. Provide actionable operational recommendations if applicable.
6. Do NOT format with markdown code blocks. Use bullet points and paragraphs.
"""

def generate_prompt(page: str, data: dict) -> str:
    # Context-aware prompts based on the page
    context_guidance = ""
    if page.lower() == "dashboard":
        context_guidance = "Focus on the overall health of the organization, highlighting major bottlenecks in maintenance or bookings."
    elif page.lower() == "assets":
        context_guidance = "Focus on asset availability, allocation ratios, and potential shortages."
    elif page.lower() == "maintenance":
        context_guidance = "Focus on repair queues, overdue tickets, and maintenance efficiency."
    elif page.lower() == "employees":
        context_guidance = "Focus on workforce distribution and department counts."
    
    return f"""Current Page Context: {page.capitalize()}
Guidance: {context_guidance}

Live Database JSON:
{json.dumps(data, indent=2)}

Please provide your summary and explanation."""

@app.post("/api/copilot/explain")
async def explain_data(request: ExplainRequest):
    try:
        prompt = generate_prompt(request.page, request.data)
        
        # Call the local Ollama model
        response = ollama.chat(model=OLLAMA_MODEL, messages=[
            {
                'role': 'system',
                'content': SYSTEM_INSTRUCTION
            },
            {
                'role': 'user',
                'content': prompt
            }
        ])
        
        return {"explanation": response['message']['content']}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
