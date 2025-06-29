from omnidimension import Client
import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)
client = Client(api_key=os.getenv("OMNIDIM_API_KEY"))