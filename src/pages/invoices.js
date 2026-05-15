import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./invoices.css";

export default function InvoicePage() {
  const { id } = useParams(); // job_card_id
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [jobInfo, setJobInfo] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // ✅ 1. GET JOB CARD DETAILS
      const jobRes = await axios.get(
        `http://localhost:5000/jobcards/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("JOB:", jobRes.data);

      // handle multiple backend formats
      const jobData =  jobRes.data;

      setJobInfo(jobData);

      // ✅ 2. GET TASKS FOR THIS JOB
      const taskRes = await axios.get(
        `http://localhost:5000/jobtask/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("TASKS:", taskRes.data);

      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);

    } catch (err) {
      console.error("FETCH ERROR:", err);
    }
  };

  // ✅ SAFE TOTAL
  const total = Array.isArray(tasks)
    ? tasks.reduce((sum, t) => sum + Number(t.fee || t.fees || 0), 0)
    : 0;

  const handlePrint = () => window.print();

  const handleCashOut = async () => {
    try {
          if (jobInfo?.status === "Cashed") {
      alert("Invoice already cashed out");
      return;
    }
        //  console.log(jobInfo);
    if (jobInfo?.status !== "completed" && jobInfo?.status !== "Cashed") {
      alert("Not all tasks are completed");
      return;
    }

   
  
      await axios.put(
        `http://localhost:5000/invoices/${id}/cashout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Invoice cashed out");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Cashout failed");
    }
  };

  //  LOADING SAFE
  if (!jobInfo) return <div>Loading...</div>;

  return (
    <div className="invoice-page">

      {/* HEADER */}
      <div className="invoice-header">
        <div>
          <h2>Abou Chaaya Garage</h2>
          <h3>Invoice</h3>
          <p><b>Client:</b> {jobInfo?.customer_name || "-"}</p>
          <p><b>Vehicle:</b> {jobInfo?.model || "-"}</p>
          <p><b>Plate:</b> {jobInfo?.plate_number || "-"}</p>
          <p><b>Year:</b> {jobInfo?.year || "-"}</p>
        </div>
      </div>

      {/* TABLE */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Service</th>
            <th>Description</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(tasks) && tasks.length > 0 ? (
            tasks.map((t) => (
              <tr key={t.task_id}>
                <td>{t.desc || "-"}</td>
                <td>{t.description|| "-"}</td>
                <td>{t.fee || t.fees || 0} $</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No tasks found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="invoice-total">
        <h3>Total: {total} $</h3>
      </div>

      {/* ACTIONS */}
      <div className="invoice-actions no-print">
        <button onClick={() => navigate(-1)}>Back</button>
        <button onClick={handlePrint}>Print</button>
        <button onClick={handleCashOut}>Cash Out</button>
      </div>

    </div>
  );
}