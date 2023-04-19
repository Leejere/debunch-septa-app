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

## Step 4: Make Predictions on Request from Front-End

### Steps

- **Data engineering**
  - On user request, grab data from the cache, make joins and other engineering generate a prediction-ready json
  - Tools: Google Cloud Functions

- **Prediction making**
  - Use the serialized data to produce a json containing production results
  - Tools: Google Cloud Functions
