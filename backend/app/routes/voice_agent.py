import requests
import os
import json
from fastapi import APIRouter, Request

router = APIRouter()

# Load the agent ID from the file
with open("c:/Users/riyas/SheCare-AI/backend/app/agent_id.json", "r") as f:
    agent_id = json.load(f)["agent_id"]

def ask_omni_dimension(agent_id, message):
    url = f"https://api.omnidim.io/agent/{agent_id}/chat"
    headers = {
        "Authorization": f"Bearer {os.getenv('OMNIDIM_API_KEY')}",
        "Content-Type": "application/json"
    }
    data = {"input": message}
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    return response.json().get("output", "No response from agent.")

@router.post("/voice-chat")
async def voice_chat(request: Request):
    body = await request.json()
    user_message = body.get("message")
    try:
        bot_reply = ask_omni_dimension(agent_id, user_message)
        return {"response": bot_reply}
    except Exception as e:
        print("Error from OmniDimension:", e)
        return {"response": "Sorry, I couldn't get a response from OmniDimension."}