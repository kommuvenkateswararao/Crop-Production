import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sprout,
  MapPin,
  Brain,
  RefreshCw,
  Leaf,
  Wheat,
  BarChart3,
  FlaskConical,
  LoaderCircle,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./App.css";

// Live Render backend URL
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://crop-production-hvze.onrender.com"
).replace(/\/+$/, "");

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

const compactFormat = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const chartColors = [
  "#287b45",
  "#79ad58",
  "#e5ad43",
  "#4c9c91",
  "#8b78bd",
  "#d47b57",
  "#5c8eb8",
  "#a3a64c",
];

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const errorData = await response.json();
      message =
        errorData.detail ||
        errorData.message ||
        message;
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

function App() {
  const [activeNav, setActiveNav] = useState("dashboard");

  const [summary, setSummary] = useState(null);
  const [yearData, setYearData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [cropData, setCropData] = useState([]);

  const [filters, setFilters] = useState({
    districts: [],
    crops: [],
    seasons: [],
    years: [],
  });

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [predictionForm, setPredictionForm] = useState({
    district: "",
    crop: "",
    season: "",
    year: 2025,
    area: 1,
    model: "random_forest",
  });

  const [prediction, setPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState("");

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [
        summaryResult,
        yearResult,
        districtResult,
        cropResult,
        filtersResult,
        metricsResult,
      ] = await Promise.all([
        apiRequest("/api/dashboard/summary"),
        apiRequest("/api/dashboard/production-by-year"),
        apiRequest("/api/dashboard/production-by-district"),
        apiRequest("/api/dashboard/production-by-crop"),
        apiRequest("/api/filters"),
        apiRequest("/api/ml/metrics"),
      ]);

      setSummary(summaryResult);
      setYearData(yearResult);
      setDistrictData(districtResult);
      setCropData(cropResult);
      setFilters(filtersResult);
      setMetrics(metricsResult);

      setPredictionForm((previous) => ({
        ...previous,
        district:
          previous.district ||
          filtersResult.districts?.[0] ||
          "",
        crop:
          previous.crop ||
          filtersResult.crops?.[0] ||
          "",
        season:
          previous.season ||
          filtersResult.seasons?.[0] ||
          "",
        year:
          previous.year ||
          (filtersResult.years?.length
            ? Math.max(...filtersResult.years) + 1
            : 2025),
      }));
    } catch (err) {
      setError(
        `${err.message}. Please check the deployed backend at ${API_URL}.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Sidebar navigation
  const navigateTo = (section) => {
    setActiveNav(section);

    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Update prediction form
  const updatePredictionField = (event) => {
    const { name, value } = event.target;

    setPredictionForm((previous) => ({
      ...previous,
      [name]:
        name === "year" || name === "area"
          ? Number(value)
          : value,
    }));
  };

  // Predict crop production
  const handlePrediction = async (event) => {
    event.preventDefault();

    setPrediction(null);
    setPredictionError("");

    if (
      !predictionForm.district ||
      !predictionForm.crop ||
      !predictionForm.season
    ) {
      setPredictionError(
        "Please select a district, crop, and season."
      );
      return;
    }

    if (
      !predictionForm.area ||
      predictionForm.area <= 0
    ) {
      setPredictionError(
        "Please enter an area greater than zero."
      );
      return;
    }

    setPredicting(true);

    try {
      const result = await apiRequest("/api/ml/predict", {
        method: "POST",
        body: JSON.stringify(predictionForm),
      });

      setPrediction(result);
    } catch (err) {
      setPredictionError(err.message);
    } finally {
      setPredicting(false);
    }
  };

  // Dashboard calculations
  const totalProduction =
    summary?.total_production_tonnes || 0;

  const yearChartData = yearData.map((item) => ({
    year: String(item.year),
    production: Number(item.production_tonnes || 0),
  }));

  const districtChartData = districtData.map((item) => ({
    district: item.district,
    production: Number(item.production_tonnes || 0),
  }));

  const cropChartData = cropData.slice(0, 8).map((item) => ({
    crop: item.crop,
    production: Number(item.production_tonnes || 0),
  }));

  const cropPieData = cropData.slice(0, 6).map((item) => ({
    name: item.crop,
    value: Number(item.production_tonnes || 0),
  }));

  const selectedModelMetrics =
    metrics?.models?.[metrics?.selected_model] || null;

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Sprout size={28} />
          </div>

          <div>
            <h2>
              Crop<span>Vision</span>
            </h2>
            <small>Andhra Pradesh</small>
          </div>
        </div>

        <p className="nav-heading">MAIN MENU</p>

        <button
          className={`nav-item ${
            activeNav === "dashboard" ? "active" : ""
          }`}
          onClick={() => navigateTo("dashboard")}
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        <button
          className={`nav-item ${
            activeNav === "analytics" ? "active" : ""
          }`}
          onClick={() => navigateTo("analytics")}
        >
          <Sprout size={19} />
          Crop Analytics
        </button>

        <button
          className={`nav-item ${
            activeNav === "district" ? "active" : ""
          }`}
          onClick={() => navigateTo("district")}
        >
          <MapPin size={19} />
          District Analysis
        </button>

        <button
          className={`nav-item ${
            activeNav === "prediction" ? "active" : ""
          }`}
          onClick={() => navigateTo("prediction")}
        >
          <Brain size={19} />
          ML Prediction
        </button>

        <div className="sidebar-bottom">
          <Leaf size={25} />
          <p>Smart agriculture</p>
          <small>Data-driven crop insights</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* DASHBOARD HEADER */}
        <header className="topbar" id="dashboard">
          <div>
            <h1>Crop Production Dashboard</h1>
            <p>
              Andhra Pradesh • Historical agricultural analysis
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={loadDashboard}
            disabled={loading}
          >
            <RefreshCw size={17} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </header>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="error-box">
            <strong>Could not load dashboard data.</strong>
            <p>{error}</p>
            <button
              className="refresh-btn"
              onClick={loadDashboard}
            >
              Try again
            </button>
          </div>
        )}

        {/* LOADING MESSAGE */}
        {loading && !summary && (
          <div className="notice">
            <LoaderCircle size={22} />
            <p>Loading crop production data...</p>
          </div>
        )}

        {/* WELCOME CARD */}
        <section className="welcome-card">
          <div>
            <span className="welcome-tag">
              AGRICULTURE ANALYTICS
            </span>

            <h2>Welcome to CropVision</h2>

            <p>
              Explore historical crop production, compare districts,
              and estimate crop production using machine learning.
            </p>
          </div>

          <div className="welcome-icon">
            <Wheat size={90} />
          </div>
        </section>

        {/* STATISTICS */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <BarChart3 size={23} />
            </div>
            <p>Total Records</p>
            <h2>
              {summary
                ? numberFormat.format(summary.record_count)
                : "--"}
            </h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Wheat size={23} />
            </div>
            <p>Total Production</p>
            <h2>
              {summary
                ? compactFormat.format(totalProduction)
                : "--"}
            </h2>
            <small>Tonnes</small>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Sprout size={23} />
            </div>
            <p>Total Crops</p>
            <h2>
              {summary
                ? numberFormat.format(summary.crop_count)
                : "--"}
            </h2>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <MapPin size={23} />
            </div>
            <p>Districts Covered</p>
            <h2>
              {summary
                ? numberFormat.format(summary.district_count)
                : "--"}
            </h2>
          </div>
        </section>

        {/* ADDITIONAL INFORMATION */}
        <section className="stats-grid">
          <div className="stat-card">
            <p>Total Cultivated Area</p>
            <h2>
              {summary
                ? compactFormat.format(
                    summary.total_area_hectares
                  )
                : "--"}
            </h2>
            <small>Hectares</small>
          </div>

          <div className="stat-card">
            <p>Average Yield</p>
            <h2>
              {summary
                ? numberFormat.format(
                    summary.average_yield_tonnes_per_hectare
                  )
                : "--"}
            </h2>
            <small>Tonnes per hectare</small>
          </div>

          <div className="stat-card">
            <p>First Data Year</p>
            <h2>{summary?.min_year ?? "--"}</h2>
          </div>

          <div className="stat-card">
            <p>Latest Data Year</p>
            <h2>{summary?.max_year ?? "--"}</h2>
          </div>
        </section>

        {/* CROP ANALYTICS */}
        <section className="section-title" id="analytics">
          <h2>Crop Analytics</h2>
          <p>
            Understand crop production trends and crop-wise performance.
          </p>
        </section>

        <section className="charts-grid">

          {/* PRODUCTION BY YEAR */}
          <div className="panel">
            <h3>Production by Year</h3>
            <p className="panel-subtitle">
              Historical production trend in Andhra Pradesh
            </p>

            <div className="chart-area">
              {yearChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9eee9"
                    />
                    <XAxis dataKey="year" />
                    <YAxis
                      tickFormatter={(value) =>
                        compactFormat.format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        numberFormat.format(value) + " tonnes",
                        "Production",
                      ]}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="production"
                      name="Production"
                      stroke="#287b45"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p>No yearly production data available.</p>
              )}
            </div>
          </div>

          {/* TOP CROPS */}
          <div className="panel">
            <h3>Top Crops by Production</h3>
            <p className="panel-subtitle">
              Production share of leading crops
            </p>

            <div className="chart-area">
              {cropPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cropPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={false}
                    >
                      {cropPieData.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={
                            chartColors[
                              index % chartColors.length
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) =>
                        numberFormat.format(value) + " tonnes"
                      }
                    />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>No crop data available.</p>
              )}
            </div>
          </div>

          {/* CROP COMPARISON */}
          <div className="panel full-panel">
            <h3>Crop-wise Production Comparison</h3>
            <p className="panel-subtitle">
              Compare the leading crops by total production
            </p>

            <div className="chart-area">
              {cropChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cropChartData}
                    margin={{
                      bottom: 35,
                      left: 10,
                      right: 15,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e9eee9"
                    />
                    <XAxis
                      dataKey="crop"
                      angle={-20}
                      textAnchor="end"
                      interval={0}
                      height={70}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        compactFormat.format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value) => [
                        numberFormat.format(value) + " tonnes",
                        "Production",
                      ]}
                    />
                    <Bar
                      dataKey="production"
                      name="Production"
                      fill="#398b51"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>No crop comparison data available.</p>
              )}
            </div>
          </div>
        </section>

        {/* DISTRICT ANALYSIS */}
        <section className="section-title" id="district">
          <h2>District Analysis</h2>
          <p>
            Compare historical agricultural production across districts.
          </p>
        </section>

        <section className="panel full-panel">
          <h3>District-wise Production</h3>
          <p className="panel-subtitle">
            Total recorded production by district
          </p>

          <div className="district-chart">
            {districtChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={districtChartData}
                  layout="vertical"
                  margin={{
                    left: 35,
                    right: 25,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e9eee9"
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(value) =>
                      compactFormat.format(value)
                    }
                  />
                  <YAxis
                    type="category"
                    dataKey="district"
                    width={110}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value) => [
                      numberFormat.format(value) + " tonnes",
                      "Production",
                    ]}
                  />
                  <Bar
                    dataKey="production"
                    name="Production"
                    fill="#398b51"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No district data available.</p>
            )}
          </div>
        </section>

        {/* ML PREDICTION */}
        <section
          className="section-title prediction-heading"
          id="prediction"
        >
          <h2>Machine Learning Prediction</h2>
          <p>
            Estimate crop production using historical agricultural data.
          </p>
        </section>

        <section className="prediction-panel">
          <form onSubmit={handlePrediction}>
            <div className="form-grid">

              <label>
                Select District
                <select
                  name="district"
                  value={predictionForm.district}
                  onChange={updatePredictionField}
                  required
                >
                  <option value="">Choose district</option>

                  {filters.districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Crop
                <select
                  name="crop"
                  value={predictionForm.crop}
                  onChange={updatePredictionField}
                  required
                >
                  <option value="">Choose crop</option>

                  {filters.crops.map((crop) => (
                    <option key={crop} value={crop}>
                      {crop}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Select Season
                <select
                  name="season"
                  value={predictionForm.season}
                  onChange={updatePredictionField}
                  required
                >
                  <option value="">Choose season</option>

                  {filters.seasons.map((season) => (
                    <option key={season} value={season}>
                      {season}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Prediction Year
                <input
                  type="number"
                  name="year"
                  min="2015"
                  max="2050"
                  value={predictionForm.year}
                  onChange={updatePredictionField}
                  required
                />
              </label>

              <label>
                Cultivated Area (Hectares)
                <input
                  type="number"
                  name="area"
                  min="0.01"
                  step="0.01"
                  value={predictionForm.area}
                  onChange={updatePredictionField}
                  required
                />
              </label>

              <label>
                Machine Learning Model
                <select
                  name="model"
                  value={predictionForm.model}
                  onChange={updatePredictionField}
                >
                  <option value="random_forest">
                    Random Forest
                  </option>
                  <option value="decision_tree">
                    Decision Tree
                  </option>
                </select>
              </label>
            </div>

            {predictionError && (
              <div className="error-box">
                {predictionError}
              </div>
            )}

            <button
              type="submit"
              className="predict-btn"
              disabled={predicting || loading}
            >
              {predicting ? (
                <>
                  <LoaderCircle size={18} />
                  Predicting...
                </>
              ) : (
                <>
                  <Brain size={18} />
                  Predict Crop Production
                </>
              )}
            </button>
          </form>

          {/* PREDICTION RESULT */}
          {prediction && (
            <div className="prediction-result">
              <span>PREDICTED CROP PRODUCTION</span>

              <h2>
                {numberFormat.format(
                  prediction.predicted_production_tonnes
                )}{" "}
                Tonnes
              </h2>

              <p>
                Estimated yield:{" "}
                <strong>
                  {numberFormat.format(
                    prediction.estimated_yield_tonnes_per_hectare
                  )}{" "}
                  tonnes/hectare
                </strong>
              </p>

              <p>
                Model used:{" "}
                <strong>
                  {prediction.model === "random_forest"
                    ? "Random Forest"
                    : "Decision Tree"}
                </strong>
              </p>

              <small>{prediction.note}</small>
            </div>
          )}
        </section>

        {/* MODEL PERFORMANCE */}
        <section className="model-info">
          <FlaskConical size={34} />

          <div>
            <h3>Machine Learning Model Performance</h3>

            {metrics ? (
              <>
                <p>
                  Selected model:{" "}
                  <strong>
                    {metrics.selected_model?.replace("_", " ")}
                  </strong>
                </p>

                <p>
                  Training records:{" "}
                  <strong>
                    {numberFormat.format(metrics.records_used)}
                  </strong>
                </p>

                {selectedModelMetrics && (
                  <p>
                    MAE:{" "}
                    {numberFormat.format(selectedModelMetrics.mae)}
                    {" | "}
                    RMSE:{" "}
                    {numberFormat.format(selectedModelMetrics.rmse)}
                    {" | "}
                    R²: {selectedModelMetrics.r2}
                  </p>
                )}
              </>
            ) : (
              <p>
                Model performance information is not available.
              </p>
            )}
          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <p>
            CropVision • Crop Production System • Andhra Pradesh
          </p>
          <p>
            Academic project using historical agricultural data and ML
          </p>
        </footer>

      </main>
    </div>
  );
}

export default App;
