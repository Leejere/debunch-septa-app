import dotenv
from google.cloud import storage
from os.path import dirname

dotenv.load_dotenv()

script_dir = dirname(__file__)
server_dir = dirname(dirname(script_dir))

client = storage.Client()
bucket = client.bucket("bunching-prediction-models")

for route in ["21", "33", "47"]:
    for steps in range(1, 21):
        blob = bucket.blob(f"{route}/{steps}.joblib")
        blob.upload_from_filename(
            f"{server_dir}/raw-data/serialized-models-deploy/{route}-{steps}.joblib"
        )
