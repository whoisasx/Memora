from typing import Annotated
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer
import os
from starlette.middleware.sessions import SessionMiddleware
from app.db.ess import create_index
from app.db.pg import ensure_database_exists
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware

from .routes import users,auth,contents,tags

@asynccontextmanager
async def lifespan(app: FastAPI):
	# startup tasks
	try:
		print("Creating OpenSearch index...")
		create_index()
		print("OpenSearch index created successfully")
	except Exception as e:
		print(f"Failed to create OpenSearch index: {e}")
		# Don't pass silently - this is important for debugging
	
	try:
		print("Ensuring database exists...")
		ensure_database_exists()
		print("Database setup completed")
	except Exception as e:
		print(f"Failed to ensure database exists: {e}")
	
	yield
	# shutdown tasks (none)


app = FastAPI(debug=True, lifespan=lifespan)

# add session middleware so request.session exists
# Set SECRET_KEY in your environment for production; default used only for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ya specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
	SessionMiddleware,
	secret_key=os.environ.get("JWT_SECRET_KEY", "dev-duplicate-secret"),
	session_cookie="session",
	same_site="lax",
	domain=os.getenv('DOMAIN_NAME')
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(contents.router)
app.include_router(tags.router)