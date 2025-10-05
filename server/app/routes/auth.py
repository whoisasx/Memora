from fastapi import APIRouter, Body, Path, Query, Depends, HTTPException, status, Request
from typing import Annotated, cast, Optional
from app.schemas.schemas import UserIn
from pydantic import BaseModel
from app.db.pg import get_db,Session
from app.utils import auth as auth_utils
from app.models.models import User
from sqlalchemy.exc import IntegrityError
from fastapi.responses import RedirectResponse

from authlib.integrations.starlette_client import OAuth
import os
import random

from dotenv import load_dotenv
load_dotenv()

router=APIRouter(
    prefix='/auth',
    tags=['auth'],
    dependencies=[Depends(get_db)],
    responses={404: {"description":"not-found"}}
)

class UserSignIn(BaseModel):
    username: Optional[str]=None
    email: Optional[str]=None
    password: str

@router.post('/signup', status_code=status.HTTP_201_CREATED)
def signup(user:Annotated[UserIn,Body()], db:Session=Depends(get_db)):
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
    return {
            "access_token": token, 
            "token_type":"bearer", 
            "message":"user created successfully.", 
            "success":True,
            "user":{
                "username":db_user.username,
                "email":db_user.email,
                "fullname":db_user.fullname,
                "authenticated":db_user.authenticated,
            }
        }

@router.post('/signin',status_code=status.HTTP_200_OK)
def signin(payload:Annotated[UserSignIn,Body()], db:Session=Depends(get_db)):
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
    return {
            "access_token":token, 
            "token_type":"bearer", 
            "message":"user signed in successfully.", 
            "success":True,
            "user":{
                "username":q.username,
                "email":q.email,
                "fullname":q.fullname,
                "authenticated":q.authenticated,
            }
        }

@router.post('/logout',status_code=status.HTTP_202_ACCEPTED)
def logout():
    return{
        "message":"please clear the access-token.",
        "succses":True
    }


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

@router.get('/google/callback', status_code=status.HTTP_201_CREATED)
async def google_callback(request: Request, db: Session = Depends(get_db)):
    try:
        client = oauth.create_client('google')
        if client is None:
            raise HTTPException(status_code=500, detail="Google OAuth client not configured")
        
        nonce = request.session.get('nonce')

        token = await client.authorize_access_token(request)
        if not token:
            raise HTTPException(status_code=400, detail="Failed to obtain token from provider")
        
        userinfo = None
        id_token_str = token.get("id_token") if isinstance(token, dict) else None
        
        if id_token_str:
            try:
                userinfo = await client.parse_id_token(token, nonce=nonce)
            except Exception as e:
                print(f"Error parsing id_token: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to parse id_token: {e}")
        else:
            try:
                resp = await client.get("userinfo", token=token)
                resp.raise_for_status()
                userinfo = resp.json()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to fetch user info: {e}")

        if not userinfo:
            raise HTTPException(status_code=400, detail="Could not fetch user information.")

        email = userinfo.get("email")
        name = userinfo.get("name") or userinfo.get("given_name")

        if not email:
            raise HTTPException(status_code=400, detail="Email not found in user info.")

        user = db.query(User).filter(User.email == email).first()
        if not user:
            username = f"{email.split('@')[0]}_{random.randint(1000, 9999)}"
            user = User(
                username=username,
                email=email,
                fullname=name,
                password=""
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        jwt_token = auth_utils.create_access_token(str(user.username))
        
        frontend_url = os.getenv("FRONTEND_URL")
        redirect_url = f"{frontend_url}/auth/callback?token={jwt_token}&username={user.username}&email={user.email}&fullname={user.fullname}"
        return RedirectResponse(url=redirect_url)
    except Exception as e:
        # print('error; ', e)
        frontend_url = os.getenv("FRONTEND_URL")
        redirect_url=f"{frontend_url}/signin"
        return RedirectResponse(url=redirect_url)


@router.get('/validate', status_code=status.HTTP_200_OK)
def validate_user(request: Request, token: Optional[str] = Query(None)):
    # Prefer Authorization header
    auth_header = request.headers.get('Authorization')
    raw_token = None
    if auth_header and auth_header.lower().startswith('bearer '):
        raw_token = auth_header.split(' ', 1)[1].strip()
    elif token:
        raw_token = token

    if not raw_token:
        raise HTTPException(status_code=401, detail='Authorization token not provided')

    try:
        payload = auth_utils.decode_access_token(raw_token)
        # Minimal response — caller can decide whether to allow access based on 200
        return {
            'valid': True,
            'payload': payload,
            'message': 'token is valid',
            'success': True
        }
    except Exception:
        # token decode errors, expired tokens, etc. - return a generic message
        raise HTTPException(status_code=401, detail='Invalid or expired token')
