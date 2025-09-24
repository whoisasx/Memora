from app.schemas.schemas import UrlBase
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Optional
from urllib.parse import urljoin
import json
import re
from dotenv import load_dotenv
import os
from fastapi import HTTPException, status
from typing import List
load_dotenv()


def get_url_details(url: str) -> UrlBase:
    parsed = urlparse(url)
    domain = parsed.netloc

    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "memora-bot/1.0"})
        resp.raise_for_status()
    except Exception:
        favicon = f"{parsed.scheme}://{domain}/favicon.ico" if parsed.scheme else f"https://{domain}/favicon.ico"
        return UrlBase(domain=domain, favicon=favicon, site_name=domain)

    soup = BeautifulSoup(resp.text, "html.parser")

    def get_meta(prop: Optional[str] = None, name: Optional[str] = None) -> Optional[str]:
        if prop:
            tag = soup.find("meta", property=prop)
        elif name:
            tag = soup.find("meta", attrs={"name": name})
        else:
            return None
        from bs4.element import Tag
        content = tag.get("content") if isinstance(tag, Tag) else None
        return content.strip() if content and isinstance(content, str) else None

    title = get_meta(prop="og:title") or (soup.title.string.strip() if soup.title and soup.title.string else None)
    url_description = get_meta(prop="og:description") or get_meta(name="description")
    def _valid_image_url(u: Optional[str]) -> Optional[str]:
        if not u:
            return None
        u = u.strip()
        if not u:
            return None
        if u.startswith("data:") or u.startswith("javascript:"):
            return None
        return urljoin(f"{parsed.scheme}://{domain}", u)

    def _pick_from_srcset(srcset: str) -> Optional[str]:
        # pick the candidate with largest width if available, else first
        candidates = [c.strip() for c in srcset.split(",") if c.strip()]
        best_url = None
        best_w = -1
        for c in candidates:
            parts = c.split()
            url_part = parts[0]
            w = -1
            if len(parts) > 1:
                m = re.match(r"(\d+)w$", parts[-1])
                if m:
                    w = int(m.group(1))
            if w > best_w:
                best_w = w
                best_url = url_part
            elif best_w == -1 and best_url is None:
                best_url = url_part
        return _valid_image_url(best_url)

    def get_thumbnail() -> Optional[str]:
        # 1. Open Graph variants
        for prop in ("og:image:secure_url", "og:image", "og:image:url"):
            val = get_meta(prop=prop)
            v = _valid_image_url(val)
            if v:
                return v

        # 2. Twitter cards
        for name in ("twitter:image:src", "twitter:image"):
            val = get_meta(name=name)
            v = _valid_image_url(val)
            if v:
                return v

        # 3. JSON-LD (application/ld+json)
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.get_text() or "{}")
            except Exception:
                continue
            # image can be string, dict, or list
            img = None
            if isinstance(data, dict):
                img = data.get("image")
            # if image is dict with url
            if isinstance(img, dict):
                candidate = img.get("url") or img.get("@id")
                v = _valid_image_url(candidate)
                if v:
                    return v
            if isinstance(img, list) and img:
                candidate = img[0]
                if isinstance(candidate, dict):
                    candidate = candidate.get("url") or candidate.get("@id")
                v = _valid_image_url(candidate if isinstance(candidate, str) else None)
                if v:
                    return v
            if isinstance(img, str):
                v = _valid_image_url(img)
                if v:
                    return v

        # 4. meta itemprop / name
        for prop in ("image",):
            val = get_meta(name=prop) or get_meta(prop=prop)
            v = _valid_image_url(val)
            if v:
                return v

        # 5. link rel variants
        from bs4.element import Tag
        for link in soup.find_all("link"):
            if not isinstance(link, Tag):
                continue
            href = link.attrs.get("href")
            rel = link.attrs.get("rel")
            as_attr = link.attrs.get("as")
            if href and rel:
                rel_values = rel if isinstance(rel, list) else [r.strip() for r in str(rel).split()]
                if any(x in ("image_src", "preload", "icon", "apple-touch-icon", "apple-touch-icon-precomposed") for x in [rv.lower() for rv in rel_values]):
                    v = _valid_image_url(str(href))
                    if v:
                        return v
            if href and as_attr and str(as_attr).lower() == "image":
                v = _valid_image_url(str(href))
                if v:
                    return v

        # 6. Images on page: prefer srcset or largest width if present
        imgs = soup.find_all("img")
        # look for srcset first
        from bs4.element import Tag
        for img in imgs:
            if not isinstance(img, Tag):
                continue
            srcset = img.attrs.get("srcset")
            if srcset:
                v = _pick_from_srcset(str(srcset))
                if v:
                    return v

        # then look for largest image by width/height attributes
        best = None
        best_area = -1
        for img in imgs:
            if not isinstance(img, Tag):
                continue
            src = img.attrs.get("src") or img.attrs.get("data-src")
            if not src:
                continue
            try:
                width_attr = img.attrs.get("width", 0)
                height_attr = img.attrs.get("height", 0)
                if isinstance(width_attr, list):
                    width_attr = width_attr[0] if width_attr else 0
                if isinstance(height_attr, list):
                    height_attr = height_attr[0] if height_attr else 0
                try:
                    w = int(width_attr)
                except Exception:
                    w = 0
                try:
                    h = int(height_attr)
                except Exception:
                    h = 0
            except Exception:
                w = h = 0
            area = w * h
            if area > best_area:
                best_area = area
                best = src
        if best:
            return _valid_image_url(str(best))

        return None

    thumbnail = get_thumbnail()
    site_name = get_meta(prop="og:site_name") or domain

    # find favicon link; <link rel="icon" href="..."> or rel="shortcut icon"
    favicon_href = None
    from bs4.element import Tag
    for link in soup.find_all("link"):
        rel = None
        if isinstance(link, Tag):
            rel = link.attrs.get("rel")
            if rel:
                # rel can be a list like ['icon'] or a string
                rel_values = rel if isinstance(rel, list) else [r.strip() for r in str(rel).split()]
                if any("icon" in v.lower() for v in rel_values):
                    favicon_href = link.get("href")
                    break
    if favicon_href:
        favicon = urljoin(f"{parsed.scheme}://{domain}", str(favicon_href))
    else:
        favicon = f"{parsed.scheme}://{domain}/favicon.ico" if parsed.scheme else f"https://{domain}/favicon.ico"

    return UrlBase(
        domain=domain,
        favicon=favicon,
        title=title,
        url_description=url_description,
        thumbnail=thumbnail,
        site_name=site_name,
    )


from google import genai
from google.genai.types import EmbedContentConfig

api_key= os.getenv('GOOGLE_API_KEY','dupicate_api_key')

def get_embeddings(url_obj, max_input_tokens: int = 900)->List[float]:
    def _est_tokens(s: str) -> int:
        return max(0, len(s) // 4)

    def _trim_to_tokens(s: str, allowed_tokens: int) -> str:
        if not s or allowed_tokens <= 0:
            return ""
        allowed_chars = allowed_tokens * 4
        if len(s) <= allowed_chars:
            return s
        cut = s[:allowed_chars]
        if " " in cut:
            cut = cut.rsplit(" ", 1)[0]
        return cut
    
    if isinstance(url_obj, dict):
        title = (url_obj.get("title") or "").strip()
        desc = (url_obj.get("description") or url_obj.get("url_description") or "").strip()
    else:
        title = (getattr(url_obj, "title", "") or "").strip()
        desc = (getattr(url_obj, "url_description", None) or getattr(url_obj, "description", "") or "").strip()

    title = title or ""
    desc = desc or ""

    title_tokens = _est_tokens(title)
    remaining = max_input_tokens - title_tokens
    if remaining < 0:
        title = _trim_to_tokens(title, max_input_tokens)
        remaining = 0
    if desc:
        desc = _trim_to_tokens(desc, remaining)

    combined = f"title: {title}\n{desc}" if desc else f"title: {title}"
    try:
        aiclient=genai.Client(api_key=api_key)
        response = aiclient.models.embed_content(
            model="gemini-embedding-001",
            contents=[combined],
            config=EmbedContentConfig(output_dimensionality=768)
        )
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="api client connection error.")
    if response and response.embeddings and len(response.embeddings) > 0:
        embedding_obj = response.embeddings[0]
        # Extract the embedding vector from the ContentEmbedding object
        if hasattr(embedding_obj, "values"):
            if embedding_obj.values is not None:
                return list(embedding_obj.values)
            else:
                return []
        elif isinstance(embedding_obj, list):
            return embedding_obj
        else:
            return []
    return []

def get_text_embeddings(text:str,max_input_tokens: int=2500)->List[float]:
    if len(text) >(max_input_tokens/4):
        text=text[:625]
    try:
        aiclient=genai.Client(api_key=api_key)
        response = aiclient.models.embed_content(
            model="gemini-embedding-001",
            contents=[text],
            config=EmbedContentConfig(output_dimensionality=768)
        )
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="api client connection error.")
    if response and response.embeddings and len(response.embeddings) > 0:
        embedding_obj = response.embeddings[0]
        if hasattr(embedding_obj, "values"):
            if embedding_obj.values is not None:
                return list(embedding_obj.values)
            else:
                return []
        elif isinstance(embedding_obj, list):
            return embedding_obj
        else:
            return []
    return []

def generate_string(prompt:str):
    try:
        aiclient=genai.Client(api_key=api_key)
        model="gemini-2.5-flash"
        for chunk in aiclient.models.generate_content_stream(
        model=model,
        contents=prompt,
        ):
            yield chunk.text
    except Exception as e:
        print("error: ",e)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,detail="api client connection error.")