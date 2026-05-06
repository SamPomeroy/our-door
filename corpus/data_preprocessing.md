# Data Preprocessing

## Why Preprocessing Matters

Raw data is almost never clean. Before training any model, you need to handle missing values, encode categorical variables, scale features, and deal with outliers. Garbage in = garbage out.

## Loading Data with Pandas

```python
import pandas as pd

df = pd.read_csv("data.csv")
print(df.head())       # first 5 rows
print(df.info())       # column types, null counts
print(df.describe())   # summary statistics
```

## Handling Missing Values

```python
# check for nulls
df.isnull().sum()

# option 1: drop rows with any null
df.dropna(inplace=True)

# option 2: fill with mean (for numeric columns)
df["age"].fillna(df["age"].mean(), inplace=True)

# option 3: fill with most common value (for categorical)
df["city"].fillna(df["city"].mode()[0], inplace=True)
```

Choose based on context. Dropping is safe if you have enough data. Filling avoids data loss but introduces assumptions.

## Encoding Categorical Variables

ML models need numbers, not strings.

**Label encoding** (for ordinal categories with natural order):
```python
from sklearn.preprocessing import LabelEncoder
le = LabelEncoder()
df["size"] = le.fit_transform(df["size"])  # S=0, M=1, L=2
```

**One-hot encoding** (for nominal categories with no natural order):
```python
df = pd.get_dummies(df, columns=["color"])
# creates: color_red, color_blue, color_green
```

Avoid label encoding for nominal categories -- it implies an ordering that doesn't exist.

## Feature Scaling

Many algorithms (SVM, KNN, neural nets) are sensitive to the scale of features. A feature ranging 0-1 and another ranging 0-100,000 will cause problems.

**Standardization** (mean=0, std=1) -- use when data is roughly normally distributed:
```python
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_train)
```

**Min-Max scaling** (range 0 to 1) -- use when you need a bounded range:
```python
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X_train)
```

**Important**: fit the scaler on training data only. Transform both train and test with the same fitted scaler.

```python
X_train_scaled = scaler.fit_transform(X_train)  # fit + transform
X_test_scaled = scaler.transform(X_test)         # transform only -- no fit
```

## Handling Outliers

Outliers can skew your model. Options:
- **Remove them**: if they're clearly errors
- **Cap them**: winsorize to the 1st/99th percentile
- **Transform**: log-transform skewed features to reduce outlier impact

```python
import numpy as np
df["income"] = np.log1p(df["income"])  # log(1 + x), handles zeros
```

## Train/Test Split

Always split before any preprocessing. Fitting scalers or encoders on the full dataset leaks test information into training.

```python
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# NOW preprocess, fitting only on X_train
```

## Feature Selection

Not all features help. Irrelevant features add noise.

```python
# check correlation with target
df.corr()["target"].sort_values()

# drop low-variance features
from sklearn.feature_selection import VarianceThreshold
selector = VarianceThreshold(threshold=0.01)
X_reduced = selector.fit_transform(X)
```

## Common Mistakes

- Scaling or encoding before splitting (data leakage)
- Applying fit_transform to test data instead of just transform
- Forgetting to handle nulls before training (sklearn will error)
- One-hot encoding with too many categories (creates huge sparse matrices)
