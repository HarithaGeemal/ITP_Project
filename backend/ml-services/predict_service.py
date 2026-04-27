from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load artifacts
model = joblib.load('construction_delay_model.pkl')
scaler = joblib.load('scaler.pkl')
le = joblib.load('label_encoder.pkl')
feature_columns = joblib.load('feature_columns.pkl')


def validate_request_payload(data):
    if not isinstance(data, dict):
        return False, 'JSON payload must be an object (dictionary)'

    missing = [c for c in feature_columns if c not in data]
    if missing:
        return False, f"Missing feature(s): {', '.join(missing)}"

    return True, None


@app.route('/predict', methods=['POST'])
def predict():
    payload = request.json

    valid, message = validate_request_payload(payload)
    if not valid:
        return jsonify({'error': message}), 400

    # Normalize Risk_Level to encoded numeric
    try:
        raw_risk = payload.get('Risk_Level')
        if isinstance(raw_risk, str):
            try:
                payload['Risk_Level'] = int(le.transform([raw_risk])[0])
            except Exception:
                risk_map = {'low': 0, 'medium': 1, 'high': 2}
                lower_val = raw_risk.strip().lower()
                if lower_val in risk_map:
                    payload['Risk_Level'] = risk_map[lower_val]
                else:
                    raise ValueError(f"Invalid Risk_Level string: '{raw_risk}'. Supported: {list(risk_map.keys())}")
        else:
            payload['Risk_Level'] = int(raw_risk)

    except Exception as e:
        return jsonify({'error': f"Invalid Risk_Level value: {e}"}), 400

    # Build DataFrame in exact order
    try:
        df_in = pd.DataFrame([payload], columns=feature_columns)
    except Exception as e:
        return jsonify({'error': f'Input columns error: {e}'}), 400

    # Convert to numeric where possible
    df_in = df_in.apply(pd.to_numeric, errors='coerce')

    if df_in.isna().any().any():
        nan_cols = df_in.columns[df_in.isna().any()].tolist()
        return jsonify({'error': f"Invalid numeric value(s) in: {', '.join(nan_cols)}"}), 400

    try:
        scaled = scaler.transform(df_in)
        prediction = model.predict(scaled)
        return jsonify({'delay_days': float(prediction[0]), 'input': payload})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(port=5003, debug=True)