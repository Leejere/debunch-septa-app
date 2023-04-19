# Workflow

## Step 1: Workspace Setup

### Steps

- **Repo creation**
  - Create a repository on GitHub for the cloud computing part of the assignment
  - Tools: git

- **Google Cloud project**
  - Create a project on Google Cloud and create service accounts
  - Tools: Google Cloud Platform

## Step 2: Model Creation

### Steps

- **Model selection**
  - Select a model based on Yihong's work
  - Tools: R

- **Training data preparation**
  - Based on requirements of the selected model, prepare clean training dataset and save it as training-deploy.gzip in the repo
  - Tools: Python/R

- **Model training**
  - Train different models N stops ahead
  - Tools: Python

- **Model serialization**
  - Serialize the models and store it in the repo
  - Tools: Python

## Step 3: Caching Real-Time Data from Transit View API

### Steps

- **Google Cloud Storage structure**
  - Invent a Google Cloud Storage folder structure that is able to cache real time data from the transit-view API
  - Tools: Google Cloud Storage

- **Functionality to write to the storage**
  - Create a Google Cloud Function that grabs data from the Transit View API every 30 minutes and caches it into Google Cloud Storage
  - Tools: Google Cloud Functions

### Information needed from the Transit View API

```json
{
  "bus": [
    {
      "lat": "39.953476000000002",
      "lng": "-75.196358000000004",
      "label": "3054",
      "route_id": "21",
      "trip": "202967",
      "VehicleID": "3054",
      "BlockID": "9105",
      "Direction": "WestBound",
      "destination": "69th Street Transportation Center",
      "heading": 270,
      "late": 3,
      "next_stop_id": "21363",
      "next_stop_name": "Walnut St & 38th St",
      "next_stop_sequence": 36,
      "estimated_seat_availability": "STANDING_ROOM_ONLY",
      "Offset": 0,
      "Offset_sec": "23",
      "timestamp": 1681939647
    },
}
```

### Outcome:

- Record every time a bus changes its next stop
- Outcome is a table like this:

| Route | Trip | Direction | Stop  | Timestamp  |
|-------|------|-----------|-------|------------|
| 21    | 343  | WestBound | 21363 | 1681939647 |
| 21    | 322  | WestBound | 21363 | 1681939647 |

where each row represents a stop arrival instance. One row is added when detecting that a bus's next stop has changed.
When making the prediction, get this table and use data from the last 3 hours, for example.

## Step 4: Make Predictions on Request from Front-End

### Steps

- **Data engineering**
  - On user request, grab data from the cache, make joins and other engineering generate a prediction-ready json
  - Tools: Google Cloud Functions

- **Prediction making**
  - Use the serialized data to produce a json containing production results
  - Tools: Google Cloud Functions

### How to engineer data

First, from the above table, extend to this form:

| Route | Trip | Direction | Stop  | Timestamp  | Previous bus trip ID | Headway | Speed | Lateness | Prev_Headway | Prev_Speed | Prev_Lateness |
|-------|------|-----------|-------|------------|----------------------|---------|-------|----------|--------------|------------|---------------|
| 21    | 343  | WestBound | 21363 | 1681939647 | 322                  | 10      | 10    | 0        | 10           | 10         | 0             |
| 21    | 322  | WestBound | 21363 | 1681939647 | 343                  | 10      | 10    | 0        | 10           | 10         | 0             |

Then, find out what is the stop 20 stops away.
Next, join stop-specific data on the 20-stops-away stop

Finally, predict.