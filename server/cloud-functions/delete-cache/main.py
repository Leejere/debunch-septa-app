from google.cloud import storage
from flask import make_response, request
import functions_framework


@functions_framework.http
def delete_cache(request):
    client = storage.Client()
    bucket = client.bucket("transit-view-cache")
    blobs = bucket.list_blobs()

    for blob in blobs:
        blob.delete()

    response = make_response("OK", 200)
    response.headers.set("Access-Control-Allow-Origin", "*")
    return response
