from google.cloud import storage
import functions_framework


@functions_framework.http
def delete_cache(request):
    client = storage.Client()
    bucket = client.bucket("transit-view-cache")
    blobs = bucket.list_blobs()

    for blob in blobs:
        blob.delete()

    return "OK"
