import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, confusion_matrix, ConfusionMatrixDisplay
import shap

# Load and prepare data
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

# Plot 1: Signal distributions
plt.figure(figsize=(15, 4))
for i, feature in enumerate(['HeartRate', 'SkinConductance', 'EEG']):
    plt.subplot(1, 3, i + 1)
    sns.histplot(data2[feature], kde=True, bins=30)
    plt.title(f'{feature} Distribution')
plt.tight_layout()
plt.show()

# Prepare features and label
X = data2[['HeartRate', 'SkinConductance', 'EEG']]
y = data2['EngagementLevel']

# Scale and train
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# Predict and evaluate
y_pred = model.predict(X_scaled)
accuracy = accuracy_score(y, y_pred)

# Plot 2: Accuracy Bar
plt.figure(figsize=(4, 4))
plt.bar(['Accuracy'], [accuracy], color='green')
plt.ylim(0, 1)
plt.title(f'Model Accuracy: {accuracy*100:.2f}%')
plt.ylabel('Accuracy')
plt.show()

# Plot 3: Confusion Matrix
cm = confusion_matrix(y, y_pred)
plt.figure(figsize=(5, 4))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Low', 'Moderate', 'High'],
            yticklabels=['Low', 'Moderate', 'High'])
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.show()

# Plot 4: SHAP Summary Plot (Bar)
explainer = shap.Explainer(model, X_scaled)
shap_values = explainer(X_scaled)

shap.summary_plot(shap_values, X, plot_type="bar", show=True)
