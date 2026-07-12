import asyncio
from main import explain_data, ExplainRequest

async def run_test():
    print("Initializing test for AssetFlow AI Copilot...\n")
    
    # 1. Hard code the JSON file/data in prompt as requested
    sample_data = {
        "total_assets": 10,
        "available": 8,
        "allocated": 6,
        "maintenance_tickets": {
            "pending": 3,
            "resolved": 12
        }
    }
    
    request = ExplainRequest(
        page="dashboard",
        data=sample_data
    )
    
    print("Calling Ollama (llama3.1:8b) via FastAPI logic...")
    print("This may take a moment depending on your hardware.\n")
    
    try:
        response = await explain_data(request)
        print("=== AI COPILOT RESPONSE ===\n")
        print(response["explanation"])
        print("\n===========================")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    asyncio.run(run_test())
