import React, { useEffect, useState } from "react";
import "./jobcard-details.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function JobCardDetails() {
  const { id } = useParams();
  const token = localStorage.getItem("token");

  // ✅ ALL STATES HERE (TOP ONLY)
  const [jobInfo, setJobInfo] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    description: "",
    service: "",
    task_parts: "",
    status: "not_started",
    fee: ""
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // ================= FETCH =================
  useEffect(() => {
    fetchJobDetails();
  }, []);

  const fetchJobDetails = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/jobcards/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobInfo(res.data);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= STATUS =================
  const getStatusClass = (status) => {
    switch (status) {
      case "not_started": return "status not";
      case "in_progress": return "status progress";
      case "completed": return "status done";
      case "invoiced": return "status invoiced";
      default: return "status";
    }
  };

  // ================= TOTAL =================
  const total = tasks.reduce((sum, t) => sum + Number(t.fee || 0), 0);

  // ================= ADD TASK =================
  const handleAddTask = async () => {
    await axios.post(
      "http://localhost:5000/tasks",
      { ...newTask, job_card_id: id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowAddModal(false);
    fetchJobDetails();
  };

  // ================= EDIT =================
  const handleEdit = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    await axios.put(
      `http://localhost:5000/tasks/${selectedTask.task_id}`,
      selectedTask,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setShowEditModal(false);
    fetchJobDetails();
  };

  if (!jobInfo) return <div>Loading...</div>;

  return (
    <div className="vehicle-container">

      {/* ================= HEADER ================= */}
      <div className="job-header">
        <h1>
          {jobInfo.customer_name} — {jobInfo.vehicle_model}
        </h1>

        <div className="job-sub">
          <span><strong>Plate:</strong> {jobInfo.plate_number}</span>
          <span><strong>Year:</strong> {jobInfo.year}</span>
          <span><strong>Engine:</strong> {jobInfo.engine}</span>
          <span><strong>Gear:</strong> {jobInfo.gear}</span>
        </div>
      </div>

      {/* ================= ADD BUTTON ================= */}
      <div className="header-actions">
        <div></div>
        <button className="add-btn" onClick={() => setShowAddModal(true)}>
          + Add Task
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <table className="vehicle-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Service</th>
            <th>Parts</th>
            <th>Status</th>
            <th>Fee</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.task_id}>
              <td>{task.task_id}</td>
              <td>{task.description}</td>
              <td>{task.service}</td>
              <td>{task.task_parts}</td>

              <td>
                <span className={getStatusClass(task.status)}>
                  {task.status.replace("_", " ")}
                </span>
              </td>

              <td>{task.fee} $</td>

              <td>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(task)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTAL ================= */}
      <div className="total-box">
        Total: {total} $
      </div>

      {/* ================= ADD MODAL ================= */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Task</h3>

            <input placeholder="Description"
              onChange={(e)=>setNewTask({...newTask, description:e.target.value})}
            />

            <input placeholder="Service"
              onChange={(e)=>setNewTask({...newTask, service:e.target.value})}
            />

            <input placeholder="Parts"
              onChange={(e)=>setNewTask({...newTask, task_parts:e.target.value})}
            />

            <input placeholder="Fee"
              onChange={(e)=>setNewTask({...newTask, fee:e.target.value})}
            />

            <select
              onChange={(e)=>setNewTask({...newTask, status:e.target.value})}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </select>

            <div className="modal-actions">
              <button onClick={()=>setShowAddModal(false)}>Cancel</button>
              <button onClick={handleAddTask}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && selectedTask && (
        <div className="modal">
          <div className="modal-content">
            <h3>Edit Task</h3>

            <input
              value={selectedTask.description}
              onChange={(e)=>setSelectedTask({...selectedTask, description:e.target.value})}
            />

            <div className="modal-actions">
              <button onClick={()=>setShowEditModal(false)}>Cancel</button>
              <button onClick={handleUpdateTask}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}