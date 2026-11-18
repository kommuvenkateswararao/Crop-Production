CROP PRODUCTION SYSTEM - DATASET PACKAGE

This ZIP contains the two CSV files uploaded for the project, plus Andhra Pradesh-only extracts.

FOLDERS
original/
  crop_production_all_india.csv       Original uploaded dataset 1 (all India)
  agridata_all_india.csv              Original uploaded dataset 2 (all India)

andhra_pradesh/
  andhra_pradesh_crop_production_dataset1.csv
  andhra_pradesh_crop_production_dataset2.csv

DATASET 1: crop_production(1).csv
- Original rows: 246,091; columns: 7
- Andhra Pradesh rows: 9,628
- Year values: 1997 through 2014 (source file uses calendar-year integers)
- Columns in AP extract: state, district, year, season, crop, area, production
- Missing production values in AP extract: 67

DATASET 2: agridata.csv
- Original rows: 175,628; columns: 8
- Andhra Pradesh rows: 11,055
- Fiscal-year values: 1998-99 through 2011-12
- Columns in AP extract: state, district, crop, year, season, area, production, yield
- Missing production values in AP extract: 100
- Missing yield values in AP extract: 100

IMPORTANT DATA NOTES
1. The Andhra Pradesh extracts retain missing values; they have not been silently deleted or filled.
2. The two datasets overlap in time but have different year formats, district labels, crop coverage and potentially different measurement conventions. Do not append/merge them blindly.
3. Dataset 1's `year` is an integer calendar year. Dataset 2's `year` is a fiscal-year string.
4. Dataset 2 includes historical district names from its source period. Administrative boundaries have changed; district matching needs a documented mapping before presenting modern-district comparisons.
5. Yield is included in Dataset 2. Do not assume its units match any yield calculated from Dataset 1 until source metadata is checked.
6. These are historical datasets and do not provide current 2026 production figures.

RECOMMENDED USE
- Use Dataset 1 as the initial production dashboard/ML source.
- Use Dataset 2 for yield analysis and validation/cross-checking.
- Before ML training: inspect missing values, duplicates, units, target distribution and year coverage; use a chronological train/test split.

The `original/` files are copies of the user's uploaded CSVs. The `andhra_pradesh/` files are filtered extracts with column names standardized only where needed; source records and missing values are retained.
