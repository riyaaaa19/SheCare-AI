from omni import client
import json

# Create a new agent (customize name/params as needed)
agent = client.agent.create(name="SheCare Voice Agent")
agent_id = agent["json"]["id"]

# Save the agent ID to a file
with open("agent_id.json", "w") as f:
    json.dump({"agent_id": agent_id}, f)

print("Agent created with ID:", agent_id)