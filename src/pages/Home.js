import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "./Home.css";

const COLORS = ["#4CAF50", "#2196F3", "#FFC107", "#9E9E9E"];

export default function Home() {
  const [data, setData] = useState({
    totalSales: 0,
    totalCards: 0,
    statusStats: [],
    salesByDate: []
  });

  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  useEffect(() => {
   

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


          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data.salesByDate}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="date"
                stroke="#151313"
                tickFormatter={(date) =>
                  new Date(date).toLocaleDateString()
                }
              />

              <YAxis stroke="#101010" />

              <Tooltip
                labelFormatter={(label) =>
                  new Date(label).toLocaleDateString("en-GB", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })
                }
              />

              <Bar dataKey="total" fill="#4caf50" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

        </div>


      </div>
    </>
  );
}