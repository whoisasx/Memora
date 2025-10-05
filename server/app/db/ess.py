from dotenv import load_dotenv
import os

load_dotenv()

# OpenSearch configuration
opensearch_url = os.environ.get("OPENSEARCH_URL") or "http://localhost:9200"
index_name = os.environ.get("OPENSEARCH_INDEX_NAME") or "memora"
dims = os.environ.get("EMBEDDING_DIMS")

if dims is None:
    raise Exception("EMBEDDING_DIMS is not set. Set EMBEDDING_DIMS in your environment (e.g. 768)")

try:
    dims = int(dims)
except ValueError:
    raise Exception(f"cannot convert EMBEDDING_DIMS='{dims}' into integer")

# Optional basic auth (useful for secured OpenSearch)
opensearch_user = os.environ.get("OPENSEARCH_USER")
opensearch_pass = os.environ.get("OPENSEARCH_PASSWORD")

try:
    from opensearchpy import OpenSearch
except Exception as e:
    raise Exception("opensearch-py is required. Install with: pip install opensearch-py") from e

# build client - handle None URL case
if not opensearch_url:
    raise Exception("OPENSEARCH_URL must be set")

# Create OpenSearch client with optional auth
if opensearch_user and opensearch_pass:
    _opensearch_client = OpenSearch(
        hosts=[opensearch_url],
        http_auth=(opensearch_user, opensearch_pass),
        use_ssl=opensearch_url.startswith("https://"),
        verify_certs=False,
    )
else:
    _opensearch_client = OpenSearch(hosts=[opensearch_url])


# Adapter class to make OpenSearch API compatible with contents.py calls
class OpenSearchAdapter:
    def __init__(self, opensearch_client):
        self._client = opensearch_client
        # Expose indices for create/exists/put_mapping calls
        self.indices = opensearch_client.indices

    def index(self, index, id=None, document=None, body=None, **kwargs):
        """Adapter method to handle both 'document' and 'body' parameters"""
        payload = document if document is not None else body
        return self._client.index(index=index, id=id, body=payload, **kwargs)

    def search(self, index, body=None, **kwargs):
        """Pass through search calls"""
        return self._client.search(index=index, body=body, **kwargs)

    def delete(self, index, id, **kwargs):
        """Pass through delete calls"""
        return self._client.delete(index=index, id=id, **kwargs)


# Export the adapter as 'client' so contents.py can use it unchanged
client = OpenSearchAdapter(_opensearch_client)

# mappings: keep 'embeddings.vector' path because routes/contents.py expects embeddings.vector
mappings = {
    "properties": {
        "id": {"type": "keyword"},
        "url": {"type": "keyword"},
        "description": {"type": "text"},
        "url_description": {"type": "text"},
        "title": {"type": "text"},
        "embeddings": {
            "properties": {
                "vector": {"type": "knn_vector", "dimension": dims}
            }
        }
    }
}


def create() -> None:
    """Create index with KNN mapping suitable for OpenSearch.

    This function is idempotent: if the index exists it will attempt to update the mapping.
    """
    if index_name is None:
        raise Exception("OPENSEARCH_INDEX_NAME is not set.")

    # check exists
    try:
        exists = client.indices.exists(index=index_name)
    except Exception:
        exists = False

    if not exists:
        index_body = {
            "settings": {
                "index": {
                    "knn": True,
                    "number_of_shards": 1,
                    "number_of_replicas": 0,
                }
            },
            "mappings": mappings,
        }
        create_response = client.indices.create(index=index_name, body=index_body)
        print("index created:", create_response)
    else:
        # update mapping (safe on OpenSearch)
        mapping_response = client.indices.put_mapping(index=index_name, body=mappings)
        print("mapping updated:", mapping_response)


def create_index() -> None:
    try:
        create()
    except Exception as e:
        print("Failed to create index:", e)
        raise
