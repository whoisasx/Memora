from google import genai
import os
from dotenv import load_dotenv
load_dotenv()

api_key= os.getenv('GOOGLE_API_KEY','dupicate_api_key')
aiclient=genai.Client(api_key=api_key)

url_obj={
    "title":"this is title",
    "description":"this is desc"
}

def get_embeddings(url_obj, max_input_tokens: int = 900):
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

    combined = f"{title}\n{desc}" if desc else f"title: {title}"

    print("combined: ", combined)

    response = aiclient.models.embed_content(
        model="gemini-embedding-001",
        contents=[combined],
    )

    print("response", response)
    if response and response.embeddings and len(response.embeddings)>0:
        vector=response.embeddings[0]
        return vector
    return []
