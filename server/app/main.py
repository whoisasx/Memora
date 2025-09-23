from typing import Annotated
from fastapi import Depends, FastAPI
from fastapi.security import OAuth2PasswordBearer
import os
from starlette.middleware.sessions import SessionMiddleware
from app.db.ess import create_index
from contextlib import asynccontextmanager

from .routes import users,auth,contents,tags


@asynccontextmanager
async def lifespan(app: FastAPI):
	# startup tasks
	try:
		create_index()
	except Exception:
		pass
	yield
	# shutdown tasks (none)


app = FastAPI(debug=True, lifespan=lifespan)

# add session middleware so request.session exists
# Set SECRET_KEY in your environment for production; default used only for dev
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("JWT_SECRET_KEY", "dev-duplicate-secret"))

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(contents.router)
app.include_router(tags.router)