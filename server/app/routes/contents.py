from fastapi import APIRouter,Depends,HTTPException,Query,Path,Body, Request, Header, status
from typing import Annotated, Optional
from app.schemas.schemas import ContentBase
from pydantic import BaseModel
import os
import jwt
from dotenv import load_dotenv
from app.dependency import verify_token
from app.utils import auth as auth_utils
from app.db.pg import get_db
from sqlalchemy.orm import Session
from app.models.models import Content, Tag
from sqlalchemy import update
load_dotenv()

secret_key=os.getenv('JWT_SECRET_KEY','dev-duplicate-secret')
algorithm="HS256"

async def extract_username(req:Request, token:Annotated[str,Depends(verify_token)]):
    try:
        payload=auth_utils.decode_access_token(token)
        username=payload.get('sub')
        if not username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")
        req.state.username=username
        return username
    except Exception as e:
        print('error: ',e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid token")

router=APIRouter(
    prefix='/contents',
    tags=["contents"],
    dependencies=[Depends(extract_username),Depends(get_db)],
    responses={404: {"description":"not found"}}
)

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_content(content:Annotated[ContentBase,Body()], req:Request, db:Session=Depends(get_db)):
    #TODO: also add to the es index
    username=req.state.username
    try:
        db_content=Content(
            id=content.id,
            url=content.url,
            description=content.description,
            color=content.color,
            timestamp=content.timestamp,
            tags=content.tags,
            username=username
        )
        db.add(db_content)

        for tag in content.tags:
            existing_tag=db.query(Tag).filter(Tag.tagname==tag).first()
            if existing_tag is None:
                db_tag = Tag(
                    tagname=tag,
                    count=1
                )
                db.add(db_tag)
            else:
                db.execute(
                    update(Tag)
                    .where(Tag.tagname == existing_tag.tagname)
                    .values(count=Tag.count + 1)
                )
        
        db.commit()
        db.refresh(db_content)
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while adding content")
    return{
        "message":"content added",
        "success":True
    }

@router.get("/")
def get_contents(username:Annotated[str,Query()], req:Request, db:Session=Depends(get_db)):
    try:
        if username!=req.state.username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="invalid username or token.")
        all_contents=[
            {
                'id': c.id,
                'url': c.url,
                'description': c.description,
                'color': c.color,
                'timestamp': c.timestamp,
                'tags': c.tags
            }
            for c in db.query(Content).filter(Content.username==username).all()
        ]
    except Exception as e:
        print("error: ", e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while getting contents.")
    return{
        "contents":all_contents,
        "message":"all contents fetched successfully.",
        "success":True
    }

@router.get("/{content_id}")
def get_content(content_id:Annotated[str,Path()],db:Session=Depends(get_db)):
    try:
        content=db.query(Content).filter(Content.id==content_id).first()
        if content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database.")
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while getting content")
    return{
        "content":{
            'id': content.id,
            'url': content.url,
            'description': content.description,
            'color': content.color,
            'timestamp': content.timestamp,
            'tags': content.tags
        },
        "message":"content fetched",
        "success":True
    }

@router.delete("/")
def delete_contents(username:Annotated[str,Query()],req:Request, db:Session=Depends(get_db)):
    #TODO: also delete to the es index
    try:
        if username!=req.state.username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid token or username.")
        count=db.query(Content).filter(Content.username == username).delete(synchronize_session=False)
        
        db.commit()
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while deleting contents.")
    return{
        "message":"contents deleted",
        "success":True,
        "count":count
    }

@router.delete("/{content_id}")
def delete_content(content_id: Annotated[str,Path()], db:Session=Depends(get_db)):
    #TODO: also delete to the es index
    try:
        content=db.query(Content).filter(Content.id==content_id).first()
        if content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database.")
        count=db.query(Content).filter(Content.id == content_id).delete()
        db.commit()
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while deleting content.")
    return{
        "message":"content deleted",
        "success":True,
        "count":count
    }

@router.put('/{content_id}')
def update_content(content_id: Annotated[str,Path()],new_content:Annotated[ContentBase,Body()], db:Session=Depends(get_db)):
    #TODO: also update to the es index
    try:
        db_content=db.query(Content).filter(Content.id==content_id).first()
        if db_content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database")
        updated_content=new_content.model_dump(exclude_unset=True)
        for key, value in updated_content.items():
            setattr(db_content, key, value)
    
        for tag in db_content.tags:
            existing_tag=db.query(Tag).filter(Tag.tagname==tag).first()
            if existing_tag is None:
                db_tag = Tag(
                    tagname=tag,
                    count=1
                )
                db.add(db_tag)
            else:
                db.execute(
                    update(Tag)
                    .where(Tag.tagname == existing_tag.tagname)
                    .values(count=Tag.count + 1)
                )
        
        db.add(db_content)
        db.commit()
        db.refresh(db_content)
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while updating content.")
    return{
        "message":"content updated",
        "success":True
    }

@router.post("/connect-to/{content_Id}")
def connect_content(content_id:Annotated[str,Body()], content_Id=Annotated[str,Path()], db:Session=Depends(get_db)):
    try:
        child=db.query(Content).filter(Content.id==content_id).first()
        parent=db.query(Content).filter(Content.id==content_Id).first()
        if child is None or parent is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content/s is not in database")
        
        parent.children_ids.append(child.id)
        print("parent before: ", parent.__dict__)
        db.commit()
        db.refresh(parent)
        print("parent:", parent.__dict__)
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while connecting content.")
    return{
        "message":"content connected",
        "success":True
    }

@router.get("/get-children/{content_id}")
def get_children(content_id:Annotated[str,Path()],db:Session=Depends(get_db)):
    try:
        content=db.query(Content).filter(Content.id==content_id).first()
        if content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database")
        all_children=content.children_ids
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while connecting content.")
    return{
        "message":"content connected",
        "success":True,
        "all_children":all_children
    }

class SearchContent(BaseModel):
    input:str
    isVector:bool

@router.post('/search')
def search_content(search_content:Annotated[SearchContent,Body()]):
    #TODO: search content 
    return