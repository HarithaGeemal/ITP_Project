import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler

# LOAD DATA
construction_df = pd.read_csv('construction_dataset.csv')
weather_df = pd.read_csv('SriLanka_Weather_Dataset.csv')

# PREPROCESS & MERGE
weather_df['time'] = pd.to_datetime(weather_df['time'])
daily_weather = weather_df.groupby('time').mean(numeric_only=True).reset_index().sort_values('time').reset_index(drop=True)
daily_weather['day_index'] = daily_weather.index
df = pd.merge(construction_df, daily_weather, left_on='Start_Constraint', right_on='day_index', how='left')

# CLEANING
irrelevant = ['Task_ID', 'day_index', 'time', 'latitude', 'longitude', 'elevation', 'country', 'city', 'sunrise', 'sunset']
df = df.drop(columns=[col for col in irrelevant if col in df.columns])
le = LabelEncoder()
df['Risk_Level'] = le.fit_transform(df['Risk_Level'])
df = df.fillna(df.median(numeric_only=True))

# CREATE TARGET (This is what the AI learns to calculate)
np.random.seed(42)
df['Delay_Days'] = (
    (df['Risk_Level'] * 3.5) + (df['precipitation_sum'] * 2.0) +
    (df['Site_Constraint_Score'] * 12.0) + np.random.normal(0, 1.5, len(df))
).clip(lower=0)

# TRAIN & SAVE
X = df.drop(columns=['Delay_Days'])
y = df['Delay_Days']
feature_columns = X.columns.tolist()
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

joblib.dump(model, 'construction_delay_model.pkl')
joblib.dump(scaler, 'scaler.pkl')
joblib.dump(le, 'label_encoder.pkl')
joblib.dump(feature_columns, 'feature_columns.pkl')
df.to_csv('preprocessed_data.csv', index=False)
print("Model trained and 'preprocessed_data.csv' created.")