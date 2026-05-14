import React, { useEffect, useState } from "react";
import "./jobcard-details.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
export default function JobCardDetails() {
    const { id } = useParams();
    const token = localStorage.getItem("token");
    const navigate = useNavigate();
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
    const [services, setServices] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // ================= FETCH =================
    useEffect(() => {
        fetchJobDetails();
        fetchTasks(); // ✅ separate call
    }, [id]);

    // 🔵 Fetch job info
    const fetchJobDetails = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/jobcards/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setJobInfo(res.data);
        } catch (err) {
            console.error("JOB FETCH ERROR:", err.response?.data || err.message);
        }
    };
    const handleDeleteTask = async (task) => {
        if (task.status !== "not_started") {
            alert("Only not started tasks can be deleted");
            return;
        }

        const confirmDelete = window.confirm(
            "Delete this task?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                `http://localhost:5000/tasks/${task.task_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            fetchTasks();
            fetchJobDetails();

        } catch (err) {
            console.error(err);
            alert("Failed to delete task");
        }
    };
    // 🟣 Fetch tasks
    const fetchTasks = async () => {
        try {
            const res = await axios.get(
                `http://localhost:5000/jobtask/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log("TASKS:", res.data);
            setTasks(res.data);
        } catch (err) {
            console.error("TASK FETCH ERROR:", err.response?.data || err.message);
        }
    };
    useEffect(() => {
        fetchServices();
    },
        []);

    const fetchServices = async () => {
        try {
            const res = await axios.get("http://localhost:5000/services");
            setServices(res.data);
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
    const total = tasks.reduce((sum, t) => sum + Number(t.fees || 0), 0);

    // ================= ADD TASK =================
    const handleAddTask = async () => {
        await axios.post(
            "http://localhost:5000/tasks",
            { ...newTask, job_card_id: id },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setShowAddModal(false);
        fetchTasks(); // ✅ refresh only tasks
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
        fetchTasks(); // ✅ refresh tasks
    };

    // ================= SAFE RENDER =================
    if (!jobInfo) {
        return <div style={{ color: "white", padding: 20 }}>Loading...</div>;
    }

    return (
        <div className="vehicle-container">

            {/* HEADER */}
            <div className="job-header">
                <h1><button onClick={() => navigate(-1)} className="back-btn">
                    ←
                </button>{jobInfo.customer_name} — {jobInfo.model} {/* ✅ FIXED */}
                </h1>



                <div className="job-sub">
                    <span><strong>Plate:</strong> {jobInfo.plate_number}</span>
                    <span><strong>Year:</strong> {jobInfo.year}</span>
                    <span><strong>Engine:</strong> {jobInfo.engine}</span>
                    <span><strong>Gear:</strong> {jobInfo.gear}</span>
                </div>
            </div>

            {/* ADD BUTTON */}
            <div className="header-actions">
                <button className="add-btn" onClick={() => setShowAddModal(true)}>
                    + Add Task
                </button>
            </div>

            {/* TABLE */}
            <table className="vehicle-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Description</th>
                        <th>Service</th>
                        <th>Parts</th>
                        <th>Status</th>
                        <th>Fees</th>
                    </tr>
                </thead>

                <tbody>
                    {tasks.map((task) => (
                        <tr key={task.task_id}>
                            <td>
                                <div className="action-buttons">

                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEdit(task)}
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    {task.status === "not_started" && (
                                        <button
                                            className="delete-btn"
                                            onClick={() => handleDeleteTask(task)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}

                                </div>
                            </td>
                            <td>{task.description}</td>
                            <td>{task.desc}</td>
                            <td>{task.task_parts}</td>

                            <td>
                                <span className={getStatusClass(task.status)}>
                                    {task.status.replace("_", " ")}
                                </span>
                            </td>

                            <td>{task.fees} $</td>


                        </tr>
                    ))}
                </tbody>
            </table>

            {/* TOTAL */}
            <div className="total-box">
                Total: {total} $
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>Add Task</h3>
                        <div className="field">
                            <label>Description</label>
                            <input placeholder="Description"
                                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                            />

                        </div>
                        <div className="field">
                            <label>Service</label>
                            <select
                                value={newTask.service}
                                onChange={(e) =>
                                    setNewTask({ ...newTask, service: e.target.value })
                                }
                            >
                                <option value="">Select Service</option>

                                {services.map((s) => (
                                    <option key={s.code} value={s.code}>
                                        {s.desc}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label>Parts</label>
                            <input placeholder="Parts"
                                onChange={(e) => setNewTask({ ...newTask, task_parts: e.target.value })}
                            />
                        </div>
                        <div className="field">
                            <label>Fees</label>
                            <input placeholder="Fees"
                                onChange={(e) => setNewTask({ ...newTask, fees: e.target.value })}
                            />
                        </div>

                        {/* <select
              onChange={(e)=>setNewTask({...newTask, status:e.target.value})}
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="invoiced">Invoiced</option>
            </select> */}

                        <div className="modal-actions">
                            <button onClick={() => setShowAddModal(false)}>Cancel</button>
                            <button onClick={handleAddTask}>Save</button>
                        </div>

                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedTask && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>Edit Task</h3>

                        {/* DESCRIPTION */}
                        <div className="field">
                            <label>Description</label>
                            <input
                                placeholder="Description"
                                value={selectedTask.description || ""}
                                onChange={(e) =>
                                    setSelectedTask({
                                        ...selectedTask,
                                        description: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* SERVICE (desc) */}
                        <div className="field">
                            <label>Service</label>
                            <select
                                value={selectedTask.service || ""}
                                onChange={(e) =>
                                    setSelectedTask({
                                        ...selectedTask,
                                        service: e.target.value
                                    })
                                }
                            >
                                <option value="">Select Service</option>

                                {services.map((s) => (
                                    <option key={s.code} value={s.code}>
                                        {s.desc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* PARTS */}

                        <div className="field">
                            <label>Parts</label>
                            <input
                                placeholder="Parts"
                                value={selectedTask.task_parts || ""}
                                onChange={(e) =>
                                    setSelectedTask({
                                        ...selectedTask,
                                        task_parts: e.target.value
                                    })
                                }
                            />
                        </div>

                        {/* STATUS */}
                        <div className="field">
                            <label>Status</label>
                            <select
                                value={selectedTask.status || "not_started"}
                                onChange={(e) =>
                                    setSelectedTask({
                                        ...selectedTask,
                                        status: e.target.value
                                    })
                                }
                            >
                                <option value="not_started">Not Started</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="invoiced">Invoiced</option>
                            </select>
                        </div>
                        {/* FEE */}
                        <div className="field">
                            <label>Fees</label>
                            <input
                                type="number"
                                placeholder="Fees"
                                value={selectedTask.fees || ""}
                                onChange={(e) =>
                                    setSelectedTask({
                                        ...selectedTask,
                                        fees: e.target.value
                                    })
                                }
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button onClick={handleUpdateTask}>Save</button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}