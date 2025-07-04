import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import shap

from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)

# === Load and clean data ===
data2 = pd.read_csv('data/data2.csv')

data2 = data2.rename(columns={
    'HRV': 'HeartRate',
    'GSR': 'SkinConductance',
    'EEG_Alpha_Waves': 'EEG',
    'Engagement_Level': 'EngagementLevel'
})

data2 = data2[['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']]
data2[['HeartRate', 'SkinConductance', 'EEG']] = data2[['HeartRate', 'SkinConductance', 'EEG']].replace(0, np.nan)
column_means = data2[['HeartRate', 'SkinConductance', 'EEG']].mean()
data2.fillna(column_means, inplace=True)

# === Plot 1: Signal Distributions ===
plt.figure(figsize=(15, 4))
for i, feature in enumerate(['HeartRate', 'SkinConductance', 'EEG']):
    plt.subplot(1, 3, i + 1)
    sns.histplot(data2[feature], kde=True, bins=30)
    plt.title(f'{feature} Distribution')
plt.tight_layout()
plt.show()

# === Prepare features and labels ===
X = data2[['HeartRate', 'SkinConductance', 'EEG']]
y = data2['EngagementLevel']

# === Split into training and testing sets ===
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# === Scale features ===
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# === Train model ===
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# === Predict on test set ===
y_pred = model.predict(X_test_scaled)

# === Evaluate model ===
accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, average='weighted')
recall = recall_score(y_test, y_pred, average='weighted')
f1 = f1_score(y_test, y_pred, average='weighted')
cm = confusion_matrix(y_test, y_pred)

# === Print evaluation ===
print("\nModel Evaluation Results:")
print("-------------------------")
print(f"Accuracy       : {accuracy:.4f}")
print(f"Precision      : {precision:.4f}")
print(f"Recall         : {recall:.4f}")
print(f"F1 Score       : {f1:.4f}")
print("\nConfusion Matrix:\n", cm)
print("\nClassification Report:\n")
print(classification_report(y_test, y_pred))

# === Plot 2: Accuracy Bar ===
plt.figure(figsize=(4, 4))
plt.bar(['Accuracy'], [accuracy], color='green')
plt.ylim(0, 1)
plt.title(f'Model Accuracy: {accuracy*100:.2f}%')
plt.ylabel('Accuracy')
plt.show()

# === Plot 3: Confusion Matrix ===
plt.figure(figsize=(5, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=np.unique(y),
            yticklabels=np.unique(y))
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.show()

# === Plot 4: SHAP Summary Plot ===
# For SHAP, use a small sample if dataset is large
sample_X = X_test_scaled if X_test_scaled.shape[0] <= 500 else X_test_scaled[:500]

explainer = shap.Explainer(model, X_train_scaled)
shap_values = explainer(sample_X)

shap.summary_plot(shap_values, pd.DataFrame(sample_X, columns=X.columns), plot_type="bar", show=True)
