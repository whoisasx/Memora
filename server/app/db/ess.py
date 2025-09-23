from elasticsearch import Elasticsearch
from dotenv import load_dotenv
import os

load_dotenv()
ess_url=os.environ.get('ELASTIC_URL')
api_key=os.environ.get('ELASTIC_API_KEY')
index_name=os.environ.get('ELASTIC_INDEX_NAME')
dims=os.environ.get('EMBEDDING_DIMS')

if not ess_url or not api_key or not index_name or not dims:
    raise Exception('elastic database url or api key or index_name or dims is missing.')

try:
    dims=int(dims)
except ValueError as e:
    raise Exception(f"can not convert {dims} into integer")

assert ess_url is not None
assert api_key is not None
assert index_name is not None
assert dims is not None

client=Elasticsearch(
    ess_url,
    api_key=api_key
)

mappings={
    "properties":{
        "id":{"type":"keyword"},
        "url":{"type":"keyword"},
        "description":{"type":"text"},
        "embedding":{
            "type":"dense_vector",
            "dims":dims
        }
    }
}


def create()->None:
    if index_name is None:
        raise Exception("ELASTIC_INDEX_NAME is not set.")
    
    if not client.indices.exists(index=index_name):
        index_body={
            "settings":{
                "number_of_shards":1,
                "number_of_replicas":0
            },
            "mappings":mappings
        }
        create_response=client.indices.create(index=index_name,body=index_body)
        print("index created: ", create_response)
    else:
        mapping_response = client.indices.put_mapping(index=index_name, body=mappings)
        print("mapping updated: ", mapping_response)

def create_index()->None:
    try:
        create()
    except Exception as e:
        print("Failed to create index:", e)
        raise