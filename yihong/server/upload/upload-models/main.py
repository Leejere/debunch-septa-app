import dotenv
from google.cloud import storage
from os.path import dirname

dotenv.load_dotenv()

script_dir = dirname(__file__)
server_dir = dirname(dirname(script_dir))

client = storage.Client()
bucket = client.bucket("musa-509-bunching-prediction")
folder = "musa-509-bunching-prediction-model/"

for route in ["21", "33", "47"]:
    for steps in range(11, 21):
        blob = bucket.blob(folder + f"{route}/{steps}.joblib")
        blob.upload_from_filename(
            f"{server_dir}/serialized-models/{route}-{steps}.joblib"
        )
