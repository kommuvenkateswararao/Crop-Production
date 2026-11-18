"""Train Decision Tree and Random Forest models using AP dataset 1."""
from pathlib import Path
import json
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT.parent / "datasets" / "Crop_Production_Datasets" / "andhra_pradesh" / "andhra_pradesh_crop_production_dataset1.csv"
OUT = Path(__file__).resolve().parent / "models"
FEATURES = ["district", "crop", "season", "year", "area"]

def main():
    df = pd.read_csv(DATA)
    df = df.dropna(subset=["production", "area"])
    df = df[(df["production"] >= 0) & (df["area"] > 0)]
    df = df.rename(columns={"district_name":"district"})
    X = df[FEATURES]
    y = df["production"].astype(float)
    years = sorted(df["year"].dropna().unique())
    if len(years) >= 5:
        test_years = years[-max(1, round(len(years)*0.2)):]
        train_mask = ~df["year"].isin(test_years)
        X_train, X_test = X[train_mask], X[~train_mask]
        y_train, y_test = y[train_mask], y[~train_mask]
        split = f"train through {max(df.loc[train_mask,'year'])}; test {min(test_years)}-{max(test_years)}"
    else:
        from sklearn.model_selection import train_test_split
        X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=.2,random_state=42)
        split = "random 80/20 fallback; limited year span"
    numeric = ["year","area"]
    categorical = ["district","crop","season"]
    prep = ColumnTransformer([
        ("num", Pipeline([("impute",SimpleImputer(strategy="median"))]), numeric),
        ("cat", Pipeline([("impute",SimpleImputer(strategy="most_frequent")),("onehot",OneHotEncoder(handle_unknown="ignore"))]), categorical)
    ])
    models = {
        "decision_tree": DecisionTreeRegressor(max_depth=12, min_samples_leaf=3, random_state=42),
        "random_forest": RandomForestRegressor(n_estimators=250, min_samples_leaf=2, random_state=42, n_jobs=-1)
    }
    OUT.mkdir(parents=True, exist_ok=True)
    metrics = {"dataset":str(DATA.name),"records_used":int(len(df)),"split":split,"models":{}}
    for name, estimator in models.items():
        pipe = Pipeline([("preprocess",prep),("model",estimator)])
        pipe.fit(X_train,y_train)
        pred = pipe.predict(X_test)
        rmse = mean_squared_error(y_test,pred) ** .5
        metrics["models"][name] = {"mae":round(float(mean_absolute_error(y_test,pred)),3),
            "rmse":round(float(rmse),3),"r2":round(float(r2_score(y_test,pred)),4)}
        joblib.dump(pipe, OUT/f"{name}.joblib")
    metrics["selected_model"] = min(metrics["models"],key=lambda k:metrics["models"][k]["rmse"])
    (OUT/"metrics.json").write_text(json.dumps(metrics,indent=2),encoding="utf-8")
    print(json.dumps(metrics,indent=2))

if __name__ == "__main__": main()
