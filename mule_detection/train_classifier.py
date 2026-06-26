import pandas as pd
import numpy as np
import logging
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, 
    accuracy_score, 
    precision_score, 
    recall_score, 
    f1_score, 
    confusion_matrix
)
from imblearn.over_sampling import SMOTE

# Configure industrial-grade logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - [%(levelname)s] - %(name)s - %(message)s'
)
logger = logging.getLogger("MuleClassifier")

def generate_mock_data(n_samples: int = 5000) -> pd.DataFrame:
    """
    Generates a synthetic Pandas DataFrame mirroring the bank feed architecture.
    Ensures requested features (F115, F321, etc.) are explicitly created,
    along with filler columns up to F3923.
    Target variable is column '3924'.
    """
    logger.info(f"Synthesizing data matrix with {n_samples} samples for prototyping...")
    
    # 1. Data Matrix Alignment - Core Requested Features
    key_features = [
        'F115', 'F321', 'F527', 'F531', 'F670', 'F1692', 'F2082', 'F2122', 
        'F2582', 'F2678', 'F2737', 'F2956', 'F3043', 'F3836', 'F3887', 
        'F3889', 'F3891', 'F3894'
    ]
    
    np.random.seed(42)
    # Generate random normally distributed data for key features
    data = {feature: np.random.randn(n_samples) for feature in key_features}
    
    # Target variable '3924': 1 for Mule Account, 0 for Legitimate
    # Modeling real-world class imbalance (e.g., 3% anomaly rate)
    target = np.random.choice([0, 1], size=n_samples, p=[0.97, 0.03])
    
    # Inject synthetic signal for mule classification
    mule_idx = np.where(target == 1)[0]
    data['F527'][mule_idx] += 3.0   # Velocity of high-volume transfers
    data['F1692'][mule_idx] -= 2.0  # Age of account anomaly
    data['F3887'][mule_idx] += 1.5  # IP geolocation risk score
    
    # Construct base dataframe
    df = pd.DataFrame(data)
    
    # 2. Synthetic Generator - Filler Columns up to F3923
    logger.info("Injecting filler dimension columns to match production schema (up to F3923)...")
    existing_cols = set(key_features)
    
    # To save memory during prototyping but maintain the exact schema shape, 
    # we generate random floats for the remaining columns up to 3923.
    filler_cols = [f"F{i}" for i in range(3924) if f"F{i}" not in existing_cols]
    
    # Create the filler dataframe efficiently
    filler_data = np.random.randn(n_samples, len(filler_cols))
    filler_df = pd.DataFrame(filler_data, columns=filler_cols)
    
    # Concatenate columns
    df = pd.concat([df, filler_df], axis=1)
    
    # Add target column '3924'
    df['3924'] = target
    
    logger.info(f"Data matrix generation complete. Shape: {df.shape}")
    return df

def train_and_evaluate():
    """
    Main pipeline for training and evaluating the Mule Account Classifier.
    Implements preprocessing, SMOTE for imbalance, and a RandomForest model.
    """
    try:
        # Generate data
        df = generate_mock_data(n_samples=3000) # Adjusted sample size for rapid prototyping memory bounds
        
        # Split features and target
        X = df.drop(columns=['3924'])
        y = df['3924']
        
        logger.info(f"Initial Class Distribution:\n{y.value_counts()}")
        
        # Train/Test Split
        logger.info("Splitting dataset into train and test sets (80/20)...")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        # 3. Class Imbalance & Preprocessing
        logger.info("Standardizing features using StandardScaler...")
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        logger.info("Applying SMOTE to mitigate severe class imbalance...")
        smote = SMOTE(random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train_scaled, y_train)
        
        logger.info(f"Post-SMOTE Training Class Distribution:\n{pd.Series(y_train_resampled).value_counts()}")
        
        # 4. Production-Ready ML Training
        logger.info("Initializing and training RandomForestClassifier...")
        model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
        model.fit(X_train_resampled, y_train_resampled)
        
        # Inference
        logger.info("Generating predictions on the test holdout set...")
        y_pred = model.predict(X_test_scaled)
        
        # 5. Evaluation Output
        print("\n" + "="*60)
        print("🚀 EVO-MAL AI: MULE ACCOUNT TRANSACTION CLASSIFIER DASHBOARD")
        print("="*60)
        print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
        print(f"Precision: {precision_score(y_test, y_pred):.4f}")
        print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
        print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
        print("-" * 60)
        
        cm = confusion_matrix(y_test, y_pred)
        print("CONFUSION MATRIX:")
        print(f"  [True Negatives] Legitimate as Legitimate: {cm[0][0]}")
        print(f"  [False Positives] Legitimate as Mule:      {cm[0][1]}  <-- (False Alarm Risk)")
        print(f"  [False Negatives] Mule as Legitimate:      {cm[1][0]}  <-- (Missed Fraud Risk)")
        print(f"  [True Positives] Mule as Mule:             {cm[1][1]}  <-- (Caught Fraudster)")
        print("-" * 60)
        print("DETAILED CLASSIFICATION REPORT (Target Variable '3924'):")
        print(classification_report(y_test, y_pred, target_names=["Legitimate (0)", "Mule Account (1)"]))
        print("="*60 + "\n")
        
        logger.info("Pipeline execution completed successfully.")
        
    except Exception as e:
        logger.error(f"Critical failure in Mule Detection pipeline: {str(e)}", exc_info=True)

if __name__ == "__main__":
    train_and_evaluate()
