from fastapi import APIRouter, Depends, HTTPException, Query, Path, Body, status
from typing import Annotated
from app.schemas.schemas import UserBase
import random
from sqlalchemy.orm import Session
from app.db.pg import get_db
from app.models.models import User
from app.utils import auth as auth_utils
from ..dependency import verify_token

router = APIRouter(
    prefix="/api/users",
    tags=["users"],
    dependencies=[Depends(get_db)],
    responses={404: {"description": "not found"}},
)

adjectives = ["happy", "fast", "clever", "brave", "smart"]
nouns = ["lion", "tiger", "panda", "wolf", "fox"]

def create_username():
    adj = random.choice(adjectives)
    noun = random.choice(nouns)
    num = random.randint(1, 99)
    return f"{adj}_{noun}{num}"


@router.get("/", status_code=status.HTTP_200_OK)
def read_users(db: Session = Depends(get_db)):
    try:
        all_users = db.query(User).all()
        users = [
            {
                'username': user.username,
                'email': user.email,
                'fullname': user.fullname,
                'authenticated': user.authenticated
            }
            for user in all_users
        ]
    except Exception as e:
        print("Error getting all users: ", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Server error while getting all the users.")
    return {"users": users, "message": 'all users retrieved successfully', "success": True}

@router.get("/{username}")
def read_user(username:Annotated[str,Path(min_length=3, max_length=20)], token:Annotated[str,Depends(verify_token)],db: Session = Depends(get_db)):
    try:
        try:
            auth_token=auth_utils.decode_access_token(token)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token expired or invalid")

        auth_username=auth_token.get('sub')
        if auth_username is None or auth_username!=username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid token.")
        
        user_data=db.query(User).filter(User.username==auth_username).first()
        if not user_data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="error while getting user detail.")
    finally:
        db.close()

    return{
        "user": {
            "username":user_data.username,
            "email":user_data.email,
            "fullname":user_data.fullname,
            "authenticated":user_data.authenticated
        },
        "message":"user details fetched.",
        "success":True
        }

@router.put('/{username}')
def update_user(username:Annotated[str,Path()], new_user:Annotated[UserBase, Body()], token:Annotated[str, Depends(verify_token)],db: Session = Depends(get_db)):
    try:
        import jwt as _jwt
        try:
            auth_token = auth_utils.decode_access_token(token)
        except _jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token expired")
        except _jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")

        auth_username = auth_token.get('sub')
        if auth_username is None or auth_username != username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token.")

        user_obj = db.query(User).filter(User.username == auth_username).first()
        if not user_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

        # apply only allowed updates
        update_data = new_user.model_dump(exclude_unset=True)
        allowed = ["password", "email", "fullname", "authenticated"]
        for key, val in update_data.items():
            if key not in allowed:
                continue
            if key == "password":
                hashed = auth_utils.get_password_hash(val)
                setattr(user_obj, "password", hashed)
            else:
                setattr(user_obj, key, val)

        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)

        user_data = {
            "username": user_obj.username,
            "email": user_obj.email,
            "fullname": user_obj.fullname,
            "authenticated": user_obj.authenticated,
        }
        token=auth_utils.create_access_token(str(user_obj.username))

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="error while updating user.")
    finally:
        db.close()

    return {
        "user": user_data,
        "access-token":token,
        "token-type":"bearer",
        "message":"user details updated",
        "success":True
    }

@router.delete('/{username}', status_code=status.HTTP_202_ACCEPTED)
def delete_user(username:Annotated[str,Path()], token:Annotated[str, Depends(verify_token)],db: Session = Depends(get_db)):
    try:
        import jwt as _jwt
        try:
            auth_token = auth_utils.decode_access_token(token)
        except _jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token expired")
        except _jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")

        auth_username = auth_token.get('sub')
        if auth_username is None or auth_username != username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token.")

        user_obj = db.query(User).filter(User.username == auth_username).first()
        if not user_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

        db.delete(user_obj)
        db.commit()

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="error while deleting user.")
    finally:
        db.close()

    return {
        "message":"user deleted from database",
        "success":True
    }

@router.post('/create-unuser', status_code=status.HTTP_201_CREATED)
def create_unauth_user(db: Session = Depends(get_db)):
    try:
        username=create_username()
        found_user=db.query(User).filter(User.username==username).first()
        while(found_user and username==found_user.username):
            username=create_username()
            found_user=db.query(User).filter(User.username==username).first()
        unauth_user=User(
            username=username,
            authenticated=False
        )
        db.add(unauth_user)
        db.commit()
        db.refresh(unauth_user)
    except Exception as e:
        db.rollback()
        print("error: ", e)
        raise HTTPException(status_code=500, detail='server error while creating user.')
    finally:
        db.close()
    token=auth_utils.create_access_token(str(unauth_user.username))
    return {
        "access-token": token, 
        "token-type": "bearer", 
        "user":{
            "username":unauth_user.username,
            "email":unauth_user.email,
            "fullname":unauth_user.fullname,
            "authenticated":unauth_user.authenticated
        },
        "message":"user-created",
        "success":True
        }

@router.post('/mark-auth')
def make_user_authenticated(password:Annotated[str,Body(min_length=8,max_length=20)], username:Annotated[str, Body()], token:Annotated[str,Depends(verify_token)],db: Session = Depends(get_db)):
    try:
        import jwt as _jwt
        try:
            auth_token = auth_utils.decode_access_token(token)
        except _jwt.ExpiredSignatureError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="token expired")
        except _jwt.InvalidTokenError:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")

        auth_username = auth_token.get('sub')
        if auth_username is None or auth_username != username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token.")

        user_obj = db.query(User).filter(User.username == auth_username).first()
        if not user_obj:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="user not found")

        hashed_password=auth_utils.get_password_hash(password)
        setattr(user_obj, "password", hashed_password)
        setattr(user_obj, "authenticated", True)

        db.add(user_obj)
        db.commit()
        db.refresh(user_obj)

        user_data = {
            "username": user_obj.username,
            "email": user_obj.email,
            "fullname": user_obj.fullname,
            "authenticated": user_obj.authenticated,
        }
        token=auth_utils.create_access_token(str(user_obj.username))

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="error while updating user.")
    finally:
        db.close()

    return {
        "user": user_data,
        "access-token":token,
        "token-type":"bearer",
        "message":"user details updated",
        "success":True
    }
