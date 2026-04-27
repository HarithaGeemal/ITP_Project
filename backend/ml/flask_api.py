"""Flask ML API"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, numpy as np, os, traceback
from datetime import datetime
app = Flask(__name__)
CORS(app)
MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
def load_models():
    try:
        risk_model = joblib.load(os.path.join(MODEL_DIR, 'delay_risk_model.pkl'))
        delay_model = joblib.load(os.path.join(MODEL_DIR, 'delay_days_model.pkl'))
        scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))
        label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))
        feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.pkl'))
        print("Models loaded!")
        return risk_model, delay_model, scaler, label_encoder, feature_columns
    except Exception as e:
        print(f"Error: {e}")
        return None, None, None, None, None
risk_model, delay_model, scaler, label_encoder, feature_columns = load_models()
def validate_input(data):
    required = ['Task_Duration_Days','Labor_Required','Equipment_Units','Material_Cost_USD','Start_Constraint','Resource_Constraint_Score','Site_Constraint_Score','Dependency_Count']
    missing = [f for f in required if f not in data]
    return (False, f"Missing: {missing}") if missing else (True, "OK")
def prepare_features(data):
    try:
        vals = [float(data.get(col, 0)) for col in feature_columns]
        return scaler.transform(np.array([vals])), None
    except Exception as e:
        return None, str(e)
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status":"healthy" if risk_model else "unhealthy"}), 200
@app.route('/predict-delay', methods=['POST'])
def predict_delay():
    try:
        if not risk_model: return jsonify({"success":False,"error":"No models"}), 503
        data = request.get_json() or {}
        valid, msg = validate_input(data)
        if not valid: return jsonify({"success":False,"error":msg}), 400
        X, err = prepare_features(data)
        if err: return jsonify({"success":False,"error":err}), 400
        risk_pred = risk_model.predict(X)[0]
        risk_proba = risk_model.predict_proba(X)
        delay_pred = delay_model.predict(X)[0]
        
        # Calculate delay days first (this is the main prediction)
        delay_days = max(0, int(np.round(delay_pred)))
        
        # Determine risk level directly from delay days (not from classifier)
        # Thresholds: Low <= 1, Medium 2-5, High >= 6
        if delay_days <= 1:
            risk_level = 'Low'
            risk_prob = 15.0
        elif delay_days < 6:
            risk_level = 'Medium'
            risk_prob = 40.0 + min((delay_days - 2) * 8, 30)  # 40-70%
        else:
            risk_level = 'High'
            risk_prob = 75.0 + min((delay_days - 6) * 3, 20)  # 75-95%
        
        risk_prob = min(95.0, max(15.0, risk_prob))  # Clamp between 15-95%
        colors = {'Low':'green','Medium':'yellow','High':'red'}
        return jsonify({
            "success": True,
            "predictions": {
                "risk_level": str(risk_level),
                "riskLevel": str(risk_level),
                "risk_probability": round(risk_prob, 2),
                "riskProbability": round(risk_prob, 2),
                "delay_days": delay_days,
                "delayDays": delay_days,
                "risk_color": colors.get(str(risk_level), "gray")
            },
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({"success":False,"error":str(e)}), 500
if __name__ == '__main__':
    print("Flask API running on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
