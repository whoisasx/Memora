from fastapi import APIRouter, Body, Path, Query, Depends, HTTPException, status, Request
from typing import Annotated, cast
from app.schemas.schemas import UserIn
from pydantic import BaseModel
from app.db.pg import SessionLocal
from app.utils import auth as auth_utils
from app.models.models import User
from sqlalchemy.exc import IntegrityError

from authlib.integrations.starlette_client import OAuth
import os
import random

from dotenv import load_dotenv
load_dotenv()

router=APIRouter(
    prefix='/auth',
    tags=['auth'],
    dependencies=[],
    responses={404: {"description":"not-found"}}
)

class UserSignIn(BaseModel):
    username: str | None
    email: str | None
    password: str

@router.post('/signup', status_code=status.HTTP_201_CREATED)
def signup(user:Annotated[UserIn,Body()]):
    db=SessionLocal()
    try:
        hashed=auth_utils.get_password_hash(user.password)
        db_user=User(
            username=user.username,
            password=hashed,
            email=user.email,
            fullname=user.fullname,
            authenticated=True
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail='username or emai already exists')
    finally:
        db.close()
    token=auth_utils.create_access_token(str(db_user.username))
    return {"access_token": token, "token_type":"bearer", "message":"user created successfully.", "success":True}

@router.post('/signin')
def signin(payload:Annotated[UserSignIn,Body()]):
    db=SessionLocal()
    try:
        q=None
        if payload.username:
            q=db.query(User).filter(User.username==payload.username).first()
        elif payload.email:
            q=db.query(User).filter(User.email==payload.email).first()
        if not q or not auth_utils.verify_password(payload.password, cast(str, q.password)):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        token=auth_utils.create_access_token(cast(str,q.username))
    finally:
        db.close()
    return {"access_token":token, "token_type":"bearer", "message":"user signed in successfully.", "success":True}

@router.post('/logout',status_code=status.HTTP_202_ACCEPTED)
def logout():
    return{
        "message":"please clear the access-token.",
        "succses":True
    }


#FIXME: fix the google outh providers.
oauth=OAuth()
GOOGLE_CLIENT_ID=os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET=os.getenv('GOOGLE_CLIENT_SECRET')
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={"scope": "openid email profile"}
    )

@router.get("/google/login")
async def google_login(request: Request):
    client = oauth.create_client('google')
    if client is None:
        raise HTTPException(status_code=500, detail="Google OAuth client not configured")
    redirect_uri = os.getenv('GOOGLE_CALLBACK_URL')
    if not redirect_uri:
        raise HTTPException(status_code=500, detail="GOOGLE_CALLBACK_URL not set")
    return await client.authorize_redirect(request, redirect_uri)

@router.get('/google/callback')
async def google_callback(request:Request):
    client = oauth.create_client('google')
    if client is None:
        raise HTTPException(status_code=500, detail="Google OAuth client not configured")
    token = await client.authorize_access_token(request)
    if not token:
        raise HTTPException(status_code=400, detail="failed to obtain token from provider")
    print(f"token: {token}")
    # Ensure token is a dict and check for id_token safely
    id_token = token.get("id_token") if isinstance(token, dict) else None
    if id_token:
        print(f"id_token: {id_token}")
        try:
            userinfo = await client.parse_id_token(request, token)
        except Exception as e:
            print(f"Error parsing id_token: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to parse id_token: {e}")
    else:
        try:
            resp = await client.get("userinfo", token=token)
            userinfo = resp.json()
        except Exception:
            raise HTTPException(status_code=400, detail="failed to fetch user info from provider")
    email=userinfo.get("email")
    name=userinfo.get("name") or userinfo.get("given_name")

    db=SessionLocal()
    try:
        user=db.query(User).filter(User.email==email).first()
        if not user:
            user=User(
                username=email.split("@")[0] + str(random.randint(0, 9999)),
                email=email,
                fullname=name,
                password=""
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        print(user)
        jwt_token=auth_utils.create_access_token(cast(str,user.username))
    finally:
        db.close()
    print(jwt_token)
    return {"access_token":jwt_token,"token_type":"bearer"}