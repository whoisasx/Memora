from fastapi import APIRouter,Depends,HTTPException,Query,Path,Body, Request, Header, status
from fastapi.responses import StreamingResponse
import json
from typing import Annotated, Optional
from app.schemas.schemas import ContentBase, ContentInES, Embeddings
from pydantic import BaseModel
import os
import jwt
from dotenv import load_dotenv
from app.dependency import verify_token
from app.utils import auth as auth_utils
from app.db.pg import get_db
from app.db.ess import client as es_client, index_name
from sqlalchemy.orm import Session
from app.models.models import Content, Tag
from sqlalchemy import update
from app.utils import url as url_utils
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
    username=req.state.username
    try:
        url_content=url_utils.get_url_details(content.url) 
        db_content=Content(
            id=content.id,
            url=content.url,
            description=content.description,
            domain=url_content.domain,
            favicon=url_content.favicon,
            title=url_content.title,
            url_description=url_content.url_description,
            thumbnail=url_content.thumbnail,
            site_name=url_content.site_name,
            color=content.color,
            timestamp=int(content.timestamp / 1000) if content.timestamp else None,
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

        url_obj={
            "title":url_content.title,
            "description":f"{url_content.url_description} {content.description}"
        }
        embedding_vector=Embeddings(vector=url_utils.get_embeddings(url_obj))
        es_obj=ContentInES(
            id=content.id,
            url=content.url,
            description=content.description if content.description else url_content.url_description,
            embeddings=embedding_vector
        )
        result=es_client.index(index=f"{index_name if index_name else 'memora'}",id=es_obj.id, document=es_obj.model_dump())
        db.commit()
        db.refresh(db_content)
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="server error while adding content")
    return{
        "message":"content added",
        "success":True,
        "content":{
            "id":db_content.id,
            "url":db_content.url,
            "description":db_content.description,
            "color":db_content.color,
            "timestame":content.timestamp,
            "tags":db_content.tags,
            "url_data":{
                "domain":db_content.domain,
                "favicon":db_content.favicon,
                "thumbnail":db_content.thumbnail,
                "site_name":db_content.site_name,
            }
        }
    }

@router.get("/",status_code=status.HTTP_200_OK)
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
                'tags': c.tags,
                "url_data":{
                    "domain":c.domain,
                    "favicon":c.favicon,
                    "thumbnail":c.thumbnail,
                    "site_name":c.site_name,
                },
                "all-children":c.children_ids,
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
            'tags': content.tags,
            "url_data":{
                "domain":content.domain,
                "favicon":content.favicon,
                "thumbnail":content.thumbnail,
                "site_name":content.site_name,
            }
        },
        "message":"content fetched",
        "success":True
    }

@router.delete("/")
def delete_contents(username:Annotated[str,Query()],req:Request, db:Session=Depends(get_db)):
    try:
        if username!=req.state.username:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail="invalid token or username.")

        content_ids = [c.id for c in db.query(Content.id).filter(Content.username == username).all()]
        es_index = f"{index_name if index_name else 'memora'}"
        for cid in content_ids:
            try:
                es_client.delete(index=es_index, id=cid)
            except Exception:
                pass
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
    try:
        content=db.query(Content).filter(Content.id==content_id).first()
        if content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database.")
        
        parents = db.query(Content).filter(Content.children_ids.any(content_id)).all()
        for parent in parents:
            # remove all occurrences of content_id from children_ids (handle None)
            children_ids_value = parent.children_ids
            if isinstance(children_ids_value, list):
                original_children = children_ids_value
            else:
                original_children = []
            filtered = [cid for cid in original_children if str(cid) != str(content_id)]
            if filtered != original_children:
                # Ensure assignment is to a plain list, not a SQLAlchemy column/expression
                setattr(parent, "children_ids", filtered)
                db.add(parent)

        es_index = f"{index_name if index_name else 'memora'}"
        try:
            es_client.delete(index=es_index, id=content_id)
        except Exception:
            pass
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
    try:
        db_content=db.query(Content).filter(Content.id==content_id).first()
        if db_content is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content is not in database")
        updated_content=new_content.model_dump(exclude_unset=True)

        original_url = db_content.url
        for key, value in updated_content.items():
            setattr(db_content, key, value)

        # if URL changed, fetch new URL details, update ES index and DB metadata
        if "url" in updated_content and updated_content.get("url") and updated_content.get("url") != original_url:
            try:
                url_value = updated_content.get("url") or ""
                url_content = url_utils.get_url_details(url_value)
                db_content.__setattr__('domain', url_content.domain)
                db_content.__setattr__('favicon', url_content.favicon)
                db_content.__setattr__('title', url_content.title)
                db_content.__setattr__('url_description', url_content.url_description)
                db_content.__setattr__('thumbnail', url_content.thumbnail)
                db_content.__setattr__('site_name', url_content.site_name)

                desc_val = updated_content.get("description")
                if desc_val is not None:
                    new_description = str(desc_val)
                else:
                    new_description = str(db_content.description) if db_content.description is not None else None

                url_obj = {
                    "title": url_content.title,
                    "description": f"{url_content.url_description} {new_description or ''}".strip()
                }
                embedding_vector = Embeddings(vector=url_utils.get_embeddings(url_obj))
                es_obj = ContentInES(
                    id=content_id,
                    url=updated_content.get("url") or "",
                    description=new_description if new_description is not None and new_description != "" else url_content.url_description,
                    embeddings=embedding_vector
                )
                es_index = f"{index_name if index_name else 'memora'}"
                try:
                    es_client.index(index=es_index, id=es_obj.id, document=es_obj.model_dump())
                except Exception:
                    pass
            except Exception:
                pass
    
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
        "success":True,
        "content":{
            "id":db_content.id,
            "url":db_content.url,
            "description":db_content.description,
            "color":db_content.color,
            "timestamp":db_content.timestamp,
            "tags":db_content.tags,
            "url_data":{
                "domain":db_content.domain,
                "favicon":db_content.favicon,
                "thumbnail":db_content.thumbnail,
                "site_name":db_content.site_name,
            }
        }
    }

@router.post("/connect-to/{content_Id}")
def connect_content(content_id:Annotated[str,Body()], content_Id=Annotated[str,Path()], db:Session=Depends(get_db)):
    try:
        child=db.query(Content).filter(Content.id==content_id).first()
        parent=db.query(Content).filter(Content.id==content_Id).first()
        if child is None or parent is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail="content/s is not in database")
        
        parent.children_ids.append(child.id)
        db.commit()
        db.refresh(parent)
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
    if search_content.isVector is False:
        q_text = (search_content.input or "")
        query = {
            "size": 5,
            "query": {
                "multi_match": {
                    "query": q_text,
                    "fields": ["description", "url"]
                }
            }
        }
        try:
            response = es_client.search(index=f"{index_name if index_name else 'memora'}", body=query)
            hits = response.get('hits', {}).get('hits', [])
            if(len(hits)>5):
                top_hits=hits[:5]
            else:
                top_hits = hits
            final_hits = [
                {
                    "id": hit["_source"]["id"],
                }
                for hit in top_hits
            ]
            return {
                "success": True, 
                "message": "content fetched",
                "hits_count": len(top_hits), 
                "hits": final_hits
            }
        except Exception as e:
            print('es search error:', e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="search error")
    else:
        try:
            input_embedding = url_utils.get_text_embeddings(search_content.input)
            query = {
                "size": 2,
                "knn": {
                    "field": "embeddings.vector",  
                    "query_vector": input_embedding, 
                    "k": 3,
                    "num_candidates": 10
                },
                "min_score": 0.8 
            }
            response = es_client.search(index=f"{index_name if index_name else 'memora'}", body=query)
            hits = response.get('hits', {}).get('hits', [])
            final_hits = [
                {
                    "id": hit["_source"]["id"],
                }
                for hit in hits
            ]

            contexts = []
            for _h in hits:
                _s = _h.get("_source", {})
                ctx_text = _s.get("url_description") or _s.get("title") or _s.get("description") or ""
                contexts.append(ctx_text)

            prompt = f"""
## Role:
You are a helpful and knowledgeable AI assistant. Your goal is to provide the most comprehensive and accurate answer possible to the user's question.

## Instructions:
1. First, carefully review the provided context documents to answer the user's question. Prioritize the provided context as your primary source of information.
2. If the context fully answers the question, synthesize the information into a single, coherent answer.
3. If the context is insufficient or does not contain the full answer, you are encouraged to supplement it with your general knowledge to provide a more complete response.
4. Crucially, you must clearly label the source of your information.
    - For information from the context, you can phrase it like: "According to the provided documents..."
    - For information from your own knowledge, you MUST state: "From my general knowledge..." or "Additionally, from my general knowledge..."
5. Combine the information from both sources into a natural, easy-to-read answer.
6. limit the response in 300-400 words.

Write clearly, structured, and easy to follow.

## User Question:
{search_content.input}

## Context Documents:
{chr(10).join([f"{i+1}. {c}" for i, c in enumerate(contexts)])}

Answer:
"""
            def event_stream():
                # first send metadata about top hits as a JSON event
                meta = {"type": "top_hits", "hits": final_hits}
                yield f"data: {json.dumps(meta)}\n\n"

                # stream LLM chunks
                try:
                    for chunk_text in url_utils.generate_string(prompt):
                        data = {"type": "chunk", "text": chunk_text}
                        yield f"data: {json.dumps(data)}\n\n"
                except HTTPException as he:
                    err = {"type": "error", "detail": he.detail}
                    yield f"data: {json.dumps(err)}\n\n"
                    return

                # final done event
                done = {"type": "done"}
                yield f"data: {json.dumps(done)}\n\n"
            
            return StreamingResponse(event_stream(), media_type="text/event-stream")
        except Exception as e:
            print('es search error:', e)
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="search error")
