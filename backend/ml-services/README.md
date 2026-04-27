# ML Service (Construction Delay Prediction)

This repository contains a small Flask-based ML model pipeline for predicting construction delay days from risk/weather data.

## 📦 Project structure

- `construction_dataset.csv` - construction features
- `SriLanka_Weather_Dataset.csv` - weather timeseries
- `preprocess_model_train.py` - data processing + model training + serialization
- `preprocessed_data.csv` - generated preprocessed dataset
- `construction_delay_model.pkl` - saved model (generated)
- `scaler.pkl` - saved scaler (generated)
- `label_encoder.pkl` - saved label encoder (generated)
- `predict_service.py` - prediction API (port 5000)
- `ai_service.py` - prediction API (port 8000) with explicit required fields

## 🧰 Requirements

- Python 3.8+
- pip

Recommended virtual environment steps:

```bash
cd f:/temp/vihara/project/ml-service/ml-service
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
```

Install dependencies:

```bash
pip install flask pandas numpy scikit-learn joblib flask-cors
```

## 🚀 Train the model

Run:

```bash
python preprocess_model_train.py
```

Expected output:
- `construction_delay_model.pkl`
- `scaler.pkl`
- `label_encoder.pkl`
- `preprocessed_data.csv`

## 🐍 Run prediction API

### `predict_service.py` (recommended)

```bash
python predict_service.py
```

Service URL:
- `http://localhost:5000/`

This API accepts JSON with the full model feature set exactly as below (the order is enforced by the code, and missing/invalid values cause 400 errors):

- Task_Duration_Days
- Labor_Required
- Equipment_Units
- Material_Cost_USD
- Start_Constraint
- Risk_Level (numeric label expected by model, e.g., 0, 1, 2; or text 'low', 'medium', 'high' maps automatically)
- Resource_Constraint_Score
- Site_Constraint_Score
- Dependency_Count
- weathercode
- temperature_2m_max
- temperature_2m_min
- temperature_2m_mean
- apparent_temperature_max
- apparent_temperature_min
- apparent_temperature_mean
- shortwave_radiation_sum
- precipitation_sum
- rain_sum
- snowfall_sum
- precipitation_hours
- windspeed_10m_max
- windgusts_10m_max
- winddirection_10m_dominant
- et0_fao_evapotranspiration

Example request (replace values with your data):

```bash
curl -X POST http://localhost:5000/ \
  -H "Content-Type: application/json" \
  -d '{
    "Task_Duration_Days": 52,
    "Labor_Required": 14,
    "Equipment_Units": 6,
    "Material_Cost_USD": 16789.73,
    "Start_Constraint": 0,
    "Risk_Level": "low",
    "Resource_Constraint_Score": 0.41,
    "Site_Constraint_Score": 0.59,
    "Dependency_Count": 4,
    "weathercode": 9.9333333,
    "temperature_2m_max": 28.84,
    "temperature_2m_min": 22.48,
    "temperature_2m_mean": 25.51,
    "apparent_temperature_max": 32.15,
    "apparent_temperature_min": 24.89,
    "apparent_temperature_mean": 28.20,
    "shortwave_radiation_sum": 19.875,
    "precipitation_sum": 0.05,
    "rain_sum": 0.05,
    "snowfall_sum": 0.0,
    "precipitation_hours": 0.2666,
    "windspeed_10m_max": 15.5867,
    "windgusts_10m_max": 33.75,
    "winddirection_10m_dominant": 44.2667,
    "et0_fao_evapotranspiration": 4.4093
  }'
```

Example success response:

```json
{
  "delay_days": 10.4721,
  "input": { ... }
}
```

## 🧪 Troubleshooting

- If any model files are missing, re-run `python preprocess_model_train.py`.
- If column mismatch occurs, confirm feature names in request exactly match those in `preprocessed_data.csv` excluding `Delay_Days`.
- Debug logging is on for `ai_service.py` (Flask `debug=True`).

## 🧹 Clean

Delete generated artifacts:

```bash
rm construction_delay_model.pkl scaler.pkl label_encoder.pkl preprocessed_data.csv
```

---

If you want, I can also add a `requirements.txt` file with pinned versions for reproducibility.