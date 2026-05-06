# Supervised Learning Basics

## What is Supervised Learning?

Supervised learning is a type of machine learning where a model learns from **labeled data** -- examples where you already know the correct answer. The model learns to map inputs (features) to outputs (labels).

Examples:
- Predicting whether an email is spam (label: spam/not spam)
- Predicting house prices (label: price in dollars)
- Detecting fraudulent job postings (label: real/fake)

## Key Terms

- **Feature**: an input variable used to make a prediction (e.g., email length, number of links)
- **Label / Target**: the output you're trying to predict (e.g., spam or not)
- **Training set**: data used to teach the model
- **Test set**: held-out data used to evaluate the model -- the model never sees this during training
- **Overfitting**: model memorizes training data but fails on new data
- **Underfitting**: model is too simple to capture the pattern

## Classification vs Regression

- **Classification**: predicting a category (spam/not spam, fraud/not fraud)
- **Regression**: predicting a continuous number (house price, temperature)

## The Basic ML Workflow

```python
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# 1. split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 2. train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# 3. predict
predictions = model.predict(X_test)

# 4. evaluate
print(accuracy_score(y_test, predictions))
```

## Evaluation Metrics for Classification

**Accuracy**: what percent of predictions were correct?
- Problem: misleading when classes are imbalanced (99% of emails are not spam)

**Precision**: of all the times you predicted positive, how often were you right?
- High precision = few false alarms

**Recall**: of all the actual positives, how many did you catch?
- High recall = few missed cases

**F1 Score**: harmonic mean of precision and recall. Balances both.

**AUC-ROC**: measures how well the model separates classes across all thresholds. 1.0 = perfect, 0.5 = random guessing.

## Bias-Variance Tradeoff

- **High bias** (underfitting): model is too simple, misses patterns in training data
- **High variance** (overfitting): model is too complex, fits noise in training data
- **Goal**: find the sweet spot -- generalizes well to new data

## Common Algorithms

| Algorithm | Good for | Notes |
|---|---|---|
| Logistic Regression | binary classification | fast, interpretable |
| Decision Tree | classification/regression | easy to visualize, prone to overfitting |
| Random Forest | classification/regression | robust, handles noise well |
| SVM | classification | effective in high dimensions |
| KNN | classification | simple, slow on large datasets |

## Cross-Validation

Instead of one train/test split, use k-fold cross-validation to get a more reliable estimate of performance:

```python
from sklearn.model_selection import cross_val_score
scores = cross_val_score(model, X, y, cv=5)
print(scores.mean())
```
