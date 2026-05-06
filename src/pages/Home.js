import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";

import "./Home.css";

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#9E9E9E"];

export default function Home() {
  const [data, setData] = useState({
    totalSales: 0,
    totalCards: 0,
    statusStats: []
  });

  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
      return;
    }

    const msg = sessionStorage.getItem("loginMessage");

    if (msg) {
      setMessage(msg);
      setShow(true);
      sessionStorage.removeItem("loginMessage");

      setTimeout(() => setShow(false), 3000);
    }

    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/dashboard");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const pieData = data.statusStats.map(item => ({
    name: item.status,
    value: item.count
  }));

  return (
    <>
      {show && <div className="toast success">{message}</div>}

      <div className="dashboard">

        {/* Cards */}
        <div className="cards">
          <div className="card purple">
            <h2>${data.totalSales}</h2>
            <p>Total Sales</p>
          </div>

          <div className="card blue">
            <h2>{data.totalCards}</h2>
            <p>Total Cards Opened</p>
          </div>

          <div className="card green">
            <h2>
              {
                data.statusStats.find(s => s.status === "completed" || s.status === "Cashed")?.count || 0
              }
            </h2>
            <p>Completed</p>
          </div>

          <div className="card blueciel">
            <h2>
              {
                data.statusStats.find(s => s.status === "in_progress")?.count || 0
              }
            </h2>
            <p>Pending</p>
          </div>
            <div className="card red">
            <h2>
              {
                data.statusStats.find(s => s.status === "not_started")?.count || 0
              }
            </h2>
            <p>Not Started</p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart">
          <PieChart width={400} height={400}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

      </div>
    </>
  );
}