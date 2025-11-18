import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TrendingUp, Maximize2 } from 'lucide-react';
import './UpgradeDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const metrics = [
  { title: 'Total Schedule Device-P2', value: '24,000', color: 'cyan', textColor: 'red' },
  { title: 'Device Upgraded-P3', value: '1,250', color: 'yellow', textColor: '#004D40' },
  { title: 'Upgrade in Progress- P2->P3', value: '80', color: 'blue', textColor: '#004D40' },
  { title: 'To be Upgraded-P2', value: '22,420', color: 'purple', textColor: '#004D40' },
  { title: 'Failed Upgrades', value: '250', color: 'red', textColor: '#004D40' },
  { title: 'Success Rate', value: '98.96%', color: 'green', textColor: '#004D40' },
];

const failureReasons = [
  { label: 'Device Compatibility Check', value: 15, color: '#FF6B6B' },
  { label: 'Pre Upgrade Check', value: 14, color: '#4ECDC4' },
  { label: 'Upgrade Process', value: 13, color: '#95A3FF' },
  { label: 'Up Mgmt Port', value: 12, color: '#FFE66D' },
  { label: 'Post Image Upgrade Check', value: 11, color: '#FFA07A' },
  { label: 'Device Activation Stagging-1', value: 10, color: '#98D8C8' },
  { label: 'Device Activation Stagging-1.5', value: 9, color: '#6C5CE7' },
  { label: 'Device Activation Stagging-2', value: 8, color: '#A29BFE' },
  { label: 'Post Activation Checks', value: 6, color: '#FD79A8' },
];

const regions = [
  { name: 'APAC', progress: 25, color: '#2563EB' },
  { name: 'EMEA', progress: 96, color: '#2563EB' },
  { name: 'North America', progress: 40, color: '#2563EB' },
];

const contractStatuses = [
  { title: 'Leaving AT&T', yesPercent: 1, noPercent: 99, primaryColor: '#60A5FA', secondaryColor: '#1E3A8A' },
  { title: 'Account Team Contacted', yesPercent: 80, noPercent: 20, primaryColor: '#38BDF8', secondaryColor: '#0EA5E9' },
  { title: 'ANFV Contracted', yesPercent: 65, noPercent: 35, primaryColor: '#7DD3FC', secondaryColor: '#1E3A8A' },
];

export function UpgradeDashboard() {
  const failureChartData = {
    labels: failureReasons.map(r => r.label),
    datasets: [{
      data: failureReasons.map(r => r.value),
      backgroundColor: failureReasons.map(r => r.color),
      borderWidth: 0,
      // hoverOffset: 10,
      spacing: 1,
    }],
  };

  // const failureChartOptions = {
  //   plugins: {
  //     legend: { display: true, position: "right" },
  //     tooltip: { enabled: true },
  //   },
  //   cutout: '45%',

  //   maintainAspectRatio: false,
  // };

  const failureChartOptions = {
    plugins: {
      legend: {
        display: false
      },
    },
    maintainAspectRatio: false,
  };

  const createContractChartData = (yesPercent: number, noPercent: number, primaryColor: string, secondaryColor: string) => ({
    datasets: [{
      data: [yesPercent, noPercent],
      backgroundColor: [primaryColor, secondaryColor],
      borderWidth: 0,
    }],
  });

  const contractChartOptions = {
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    cutout: '75%',
    maintainAspectRatio: false,
  };

  return (
    <div className="upgrade-dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Upgrade Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="project-name">
              <span>Nucleus Project - Upgrade Process End to End Tracker</span>
            </div>
            <div className="timer-grid">

              <div className="timer-item">
                <div className="timer-value">310</div>
                <div className="timer-label">Days</div>
              </div>
              <div className="timer-item">
                <div className="timer-value">8</div>
                <div className="timer-label">Hours</div>
              </div>
              <div className="timer-item">
                <div className="timer-value">42</div>
                <div className="timer-label">Minutes</div>
              </div>
              <div className="timer-item">
                <div className="timer-value">29</div>
                <div className="timer-label">Seconds</div>
              </div>
            </div>
          </div>
        </header>
        <div className='mainCard'>
          <p className="dashboard-subtitle">Upgrade Overview</p>
          {/* <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className={`metric-card metric-card-${metric.color}`}>
                <div className="metric-title">{metric.title}</div>
                <div className="metric-content">
                  <div className="metric-value">{metric.value}</div>
                  <TrendingUp className="metric-icon" />
                </div>
              </div>
            ))}
          </div> */}
           <div className="metrics-grid">

        {/* 1️⃣ Total Schedule Device */}
        <div className="metric-card" style={{ border: "2px solid #0199DC", color: "#00BCD4" }}>
          <div className="metric-title" style={{color: "#6CC0E5"}}>Total schedule device</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#0199DC"}}>24,000</div>
            <TrendingUp className="metric-icon" style={{ color: "#00BCD4" }} />
          </div>
        </div>

        {/* 2️⃣ Device Upgraded */}
        <div className="metric-card" style={{ border: "2px solid #C0C31D", color: "#D4AF37" }}>
          <div className="metric-title" style={{color: "#D5D904"}}>Device Upgraded</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#C0C31D"}}>1,250</div>
            <TrendingUp className="metric-icon" style={{ color: "#D4AF37" }} />
          </div>
        </div>

        {/* 3️⃣ Upgrade in Progress */}
        <div className="metric-card" style={{ border: "2px solid #00DCDC" }}>
          <div className="metric-title" style={{color: "#00DCDC"}}>Upgrade in Progress</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#00DCDC"}}>80</div>
            <TrendingUp className="metric-icon" style={{ color: "#00DCDC" }} />
          </div>
        </div>

        {/* 4️⃣ To be upgraded */}
        <div className="metric-card" style={{ border: "2px solid #606CD6", color: "#673AB7" }}>
          <div className="metric-title" style={{color: "#5764D7"}}>To be upgraded</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#606CD6"}}>22,420</div>
            <TrendingUp className="metric-icon" style={{ color: "#673AB7" }} />
          </div>
        </div>

        {/* 5️⃣ Failed Upgrades */}
        <div className="metric-card" style={{ border: "2px solid #E04B4B", color: "#F44336" }}>
          <div className="metric-title" style={{color: "#E04B4B"}}>Failed Upgrades</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#E04B4B"}}>250</div>
            <TrendingUp className="metric-icon" style={{ color: "#F44336" }} />
          </div>
        </div>

        {/* 6️⃣ Success Rate */}
        <div className="metric-card" style={{ border: "2px solid #5ABFC4", color: "#009688" }}>
          <div className="metric-title" style={{color: "#5ABFC4"}}>Success Rate</div>
          <div className="metric-content">
            <div className="metric-value" style={{color: "#5ABFC4"}}>98.96%</div>
            <TrendingUp className="metric-icon" style={{ color: "##5ABFC4" }} />
          </div>
        </div>

      </div>
        </div>
        <div className="charts-row">

          {/* <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Top Failure Reasons</h3>
              <button className="maximize-btn">
                <Maximize2 className="maximize-icon" />
              </button>
            </div>
            <div className="failure-content">
              <div className="failure-chart">
                <Doughnut data={failureChartData} options={failureChartOptions} />
              </div>
            </div>
          </div> */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Top Failure Reasons</h3>
              <button className="maximize-btn">
                <Maximize2 className="maximize-icon" />
              </button>
            </div>

            <div className="failure-content">
              {/* Doughnut Chart */}
              <div className="failure-chart">
                <Doughnut data={failureChartData} options={failureChartOptions} />
              </div>

              {/* Custom Legend */}
              <div className="failure-legend">
                {failureReasons.map((reason, index) => (
                  <div key={index} className="legend-item">
                    <div className="legend-left">
                      <div
                        className="legend-dot"
                        style={{ backgroundColor: reason.color }}
                      ></div>
                      <span className="legend-label">{reason.label}</span>
                    </div>
                    <span className="legend-value">{reason.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Regional Progress</h3>
              <button className="maximize-btn">
                <Maximize2 className="maximize-icon" />
              </button>
            </div>
            <div className="regional-content">
              {regions.map((region, index) => (
                <div key={index} className="region-item">
                  <div className="region-header">
                    <span className="region-name">{region.name}</span>
                    <span className="region-percent">{region.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${region.progress}%`, backgroundColor: region.color }}
                    />
                    {/* <div
                      className="progress-marker"
                      style={{ left: `calc(${region.progress}% - 8px)` }}
                    /> */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="contract-card">
          <div className="chart-header">
            <h3 className="chart-title">Account & Contract Status Overview</h3>
            <button className="maximize-btn">
              <Maximize2 className="maximize-icon" />
            </button>
          </div>
          <div className="contract-grid">
            {contractStatuses.map((status, index) => (
              <div key={index} className="contract-item">
                <h4 className="contract-title">{status.title}</h4>
                <div className="contract-chart">
                  <Doughnut
                    data={createContractChartData(
                      status.yesPercent,
                      status.noPercent,
                      status.primaryColor,
                      status.secondaryColor
                    )}
                    options={contractChartOptions}
                  />
                </div>
                {/* <div className="contract-legend">
                  <div className="contract-legend-item">
                    <div className="contract-legend-dot" style={{ backgroundColor: status.primaryColor }} />
                    <span className="contract-legend-label">Yes</span>
                    <span className="contract-legend-value">{status.yesPercent}%</span>
                  </div>
                  <div className="contract-legend-item">
                    <div className="contract-legend-dot" style={{ backgroundColor: status.secondaryColor }} />
                    <span className="contract-legend-label">No</span>
                    <span className="contract-legend-value">{status.noPercent}%</span>
                  </div>
                </div> */}

                <div className="contract-legend">
                  <div className="contract-legend-item">
                    <div className="contract-legend-dot" style={{ backgroundColor: status.primaryColor }}></div>
                    <span className="contract-legend-label">Yes</span>
                    <span className="contract-legend-value">{status.yesPercent}%</span>
                  </div>
                  <div className="contract-legend-item">
                    <div className="contract-legend-dot" style={{ backgroundColor: status.secondaryColor }}></div>
                    <span className="contract-legend-label">No</span>
                    <span className="contract-legend-value">{status.noPercent}%</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default UpgradeDashboard;