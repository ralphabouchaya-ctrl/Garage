import React, { useEffect, useState } from "react";
import "./jobcard.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Trash2 } from "lucide-react";

export default function JobCard() {
  const [jobCards, setJobCards] = useState([]);
  const [search, setSearch] = useState("");
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [services, setServices] = useState([]);
  const [models, setModels] = useState([]);
  const [engines, setEngines] = useState([]);

  const [modelSearch, setModelSearch] = useState("");
  const [engineSearch, setEngineSearch] = useState("");

  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showEngineDropdown, setShowEngineDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [plateError, setPlateError] = useState("");
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job card?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/jobcards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobCards(jobCards.filter(job => job.job_card_id !== id));

      alert("Job card deleted successfully ✅");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        err.response?.data ||
        "Failed to delete job card ❌"
      );
    }

    setTimeout(() => setMessage(""), 3000);
  };
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const [jobData, setJobData] = useState({ due_date: "" });
  const [tasks, setTasks] = useState([]);

  const [customerForm, setCustomerForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const total = tasks.reduce((sum, t) => sum + Number(t.fees || 0), 0);
  const years = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 1990 + i);
  const [vehicleForm, setVehicleForm] = useState({
    model_id: "",
    year: "",
    engine_id: "",
    gear: "",
    plate_number: "",
  });

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobCards();
    fetchCustomers();
    fetchServices();
    fetchModels();
    fetchEngines();
  }, []);
  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/services");
      setServices(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  // ================= FETCH =================
  const fetchJobCards = async () => {
    try {
      const res = await axios.get("http://localhost:5000/jobcards", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(res.data)) {
        setJobCards(res.data);
      } else if (res.data.rows) {
        setJobCards(res.data.rows);
      } else {
        setJobCards([]);
      }
    } catch (err) {
      console.error(err);
      setJobCards([]);
    }
  };
  const handleSearch = async (value) => {
    setSearch(value);

    try {
      const res = await axios.get("http://localhost:5000/jobcards", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: value,
        },
      });

      setJobCards(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setJobCards([]);
    }
  };
  const fetchCustomers = async () => {
    const res = await axios.get("http://localhost:5000/customers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCustomers(res.data);
  };
  const isOverdue = (dueDate, status) => {
    // ignore completed jobs
    if (status === "completed") return false;

    const today = new Date();
    const due = new Date(dueDate);

    // remove time comparison
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);

    return due < today;
  };
  const fetchVehicles = async (customerId) => {
    const res = await axios.get(
      `http://localhost:5000/vehicles/customer/${customerId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(res.data);
    setVehicles(res.data);
  };
  const fetchModels = async () => {
    try {
      const res = await axios.get("http://localhost:5000/models");
      setModels(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchEngines = async () => {
    try {
      const res = await axios.get("http://localhost:5000/engines");
      setEngines(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  // ================= STATUS =================
  const getStatusClass = (status) => {
    switch (status) {
      case "not_started":
        return "status not";
      case "in_progress":
        return "status progress";
      case "completed":
        return "status done";

      default:
        return "status";
    }
  };

  // ================= EDIT =================
  const handleEdit = (job) => {
    console.log("Editing job:", job);
    // later → open edit modal
  };

  // ================= CREATE JOB =================
  const handleCreateJob = async () => {
    if (!selectedCustomer || !selectedVehicle || !jobData.due_date) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/jobcards",
        {
          vehicle_id: selectedVehicle,
          due_date: jobData.due_date,
          tasks: tasks   // ✅ ADD THIS LINE
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Job created successfully! ID: " + res.data.job_card_id);

      setShowJobModal(false);
      fetchJobCards();

      // optional reset
      setTasks([]);

    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="jobcard-container">
      <div className="header">
        <input placeholder="Search card..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)} />
        <button className="add-btn" onClick={() => setShowJobModal(true)}>
          + Add card
        </button>
      </div>

      {/* ================= TABLE ================= */}

      <table>
        <thead>
          <tr>
            <th></th>
            <th>Vehicle</th>
            <th>Customer</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Total Fees</th>
          </tr>
        </thead>

        <tbody>
          {Array.isArray(jobCards) &&
            jobCards.map((job) => (
              <tr
                key={job.job_card_id}
                className={
                  isOverdue(job.due_date || job.closed_at, job.status)
                    ? "overdue-row"
                    : ""
                }
              >
                <td>
                  <div className="action-buttons">

                    {job.status === "not_started" && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(job.job_card_id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <button
                      className="btn-view"
                      onClick={() =>
                        navigate(`/jobcarddetails/${job.job_card_id}`)
                      }
                    >
                      <Eye size={16} />
                    </button>

                  </div>
                </td>

                <td>{job.vehicle}</td>
                <td>{job.customer}</td>
                <td>{new Date(job.closed_at).toDateString()}</td>

                <td>
                  <span className={getStatusClass(job.status)}>
                    {job.status.replace("_", " ")}
                  </span>
                </td>

                <td>{job.total} $</td>
              </tr>
            ))}
        </tbody>
      </table>


      {/* ================= JOB MODAL ================= */}
      {showJobModal && (
        <div className="modal">
          <div className="modal-card">

            {/* HEADER */}
            <div className="modal-header">
              <h2>Create Job Card</h2>
            </div>

            {/* BODY */}
            <div className="modal-body">

              {/* CUSTOMER + VEHICLE */}
              <div className="form-row">

                {/* CUSTOMER */}
                <div className="field">
                  <label>Customer</label>
                  <input
                    type="text"
                    placeholder="Search customer..."
                    value={customerSearch}

                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setSelectedCustomer(null);
                      setShowCustomerDropdown(true);   // ✅ OPEN
                    }}
                    onFocus={() => setShowCustomerDropdown(true)} // optional UX
                  />

                  {showCustomerDropdown && (
                    <div className="dropdown">
                      <div
                        className="dropdown-item add"
                        onClick={() => setShowCustomerModal(true)}
                      >
                        + Add Customer
                      </div>

                      {customers
                        .filter((c) =>
                          `${c.first_name} ${c.last_name}`
                            .toLowerCase()
                            .startsWith(customerSearch.toLowerCase())
                        )
                        .map((c) => (
                          <div
                            key={c.cust_id}
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedCustomer(c.cust_id); // ✅ FIX: store ID only
                              setCustomerSearch(`${c.first_name} ${c.last_name}`);

                              setShowCustomerDropdown(false); // ✅ CLOSE

                              setSelectedVehicle(null);
                              setVehicleSearch("");
                              setShowVehicleDropdown(true);
                              fetchVehicles(c.cust_id); // ✅ API CALL
                            }}
                          >
                            {c.first_name} {c.last_name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* VEHICLE */}
                <div className="field">
                  <label>Vehicle</label>
                  <input
                    type="text"
                    placeholder="Search vehicle..."
                    value={vehicleSearch}
                    disabled={!selectedCustomer}
                    onChange={(e) => {
                      setVehicleSearch(e.target.value);
                      setShowVehicleDropdown(true);
                    }}
                    onFocus={() => selectedCustomer && setShowVehicleDropdown(true)}
                  />

                  {showVehicleDropdown && selectedCustomer && (
                    <div className="dropdown">
                      <div
                        className="dropdown-item add"
                        onClick={() => setShowVehicleModal(true)}
                      >
                        + Add Vehicle
                      </div>

                      {vehicles
                        .filter((v) =>
                          `${v.model_name} ${v.plate_number}`
                            .toLowerCase()
                            .startsWith(vehicleSearch.toLowerCase())
                        )

                        .map((v) => (
                          <div
                            key={v.id}
                            className="dropdown-item"
                            onClick={() => {
                              setSelectedVehicle(v.vehc_id); // ✅ store ID only
                              setVehicleSearch(`${v.model_name} (${v.plate_number})`);

                              setShowVehicleDropdown(false); // ✅ close dropdown
                            }}
                          >
                            {v.model_name} ({v.plate_number})
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* DATE */}
              <div className="field full">
                <label>Due Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={jobData.due_date}
                  onChange={(e) =>
                    setJobData({ ...jobData, due_date: e.target.value })
                  }
                />
              </div>

              {/* TASKS */}
              <div className="tasks-section">
                <h3>Tasks</h3>

                {tasks.map((t, index) => (
                  <div key={index} className="task-row">

                    <select
                      value={t.service}
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[index].service = e.target.value;
                        setTasks(updated);
                      }}
                    >
                      <option value="">Select Service</option>

                      {services.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.desc}
                        </option>
                      ))}
                    </select>

                    <input
                      placeholder="Description"
                      value={t.description}
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[index].description = e.target.value;
                        setTasks(updated);
                      }}
                    />

                    <input
                      placeholder="Parts"
                      value={t.parts}
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[index].parts = e.target.value;
                        setTasks(updated);
                      }}
                    />



                    <input
                      type="number"
                      placeholder="Fee"
                      value={t.fees}
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[index].fee = e.target.value;
                        setTasks(updated);
                      }}
                    />

                  </div>
                ))}

                <button
                  onClick={() =>
                    setTasks([
                      ...tasks,
                      { service: "", description: "", parts: "", status: "", fee: "" },
                    ])
                  }
                >
                  + Add Task
                </button>
              </div>

            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button onClick={handleCreateJob}>Create</button>
              <button onClick={() => setShowJobModal(false)}>Cancel</button>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Customer</h3>

            <input
              placeholder="First Name"
              value={customerForm.first_name}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  first_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Last Name"
              value={customerForm.last_name}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  last_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Email"
              value={customerForm.email}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  email: e.target.value,
                })
              }
            />

            <input
              placeholder="Phone"
              value={customerForm.phone}
              onChange={(e) =>
                setCustomerForm({
                  ...customerForm,
                  phone: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button onClick={() => setShowCustomerModal(false)}>
                Cancel
              </button>

              <button
                onClick={async () => {
                  const res = await axios.post(
                    "http://localhost:5000/customers",
                    customerForm,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  setShowCustomerModal(false);
                  fetchCustomers();
                  setSelectedCustomer(res.data.cust_id);
                  fetchVehicles(res.data.cust_id);

                  setCustomerForm({
                    first_name: "",
                    last_name: "",
                    email: "",
                    phone: "",
                  });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VEHICLE MODAL */}
      {/* VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Vehicle</h3>

            {/* MODEL */}
            <div className="field select-search">
              <label>Model</label>

              <input
                placeholder="Search model..."
                value={modelSearch}
                onFocus={() => setShowModelDropdown(true)}
                onChange={(e) => {
                  setModelSearch(e.target.value);
                  setShowModelDropdown(true);
                }}
              />

              {showModelDropdown && (
                <div className="dropdown">
                  {models
                    .filter((m) =>
                      `${m.name || ""} ${m.code || ""}`
                        .toLowerCase()
                        .includes(modelSearch.toLowerCase())
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        className="dropdown-item"
                        onClick={() => {
                          setVehicleForm({
                            ...vehicleForm,
                            model_id: m.id,
                          });

                          setModelSearch(m.name);
                          setShowModelDropdown(false);
                        }}
                      >
                        {m.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* YEAR */}
            <div className="field select-search">
              <label>Year</label>

              <input
                placeholder="Search year..."
                value={vehicleForm.year}
                onFocus={() => setShowYearDropdown(true)}
                onChange={(e) => {
                  setVehicleForm({
                    ...vehicleForm,
                    year: e.target.value,
                  });

                  setShowYearDropdown(true);
                }}
              />

              {showYearDropdown && (
                <div className="dropdown">
                  {years
                    .filter((y) =>
                      y.toString().includes(vehicleForm.year)
                    )
                    .slice(0, 10)
                    .map((y) => (
                      <div
                        key={y}
                        className="dropdown-item"
                        onClick={() => {
                          setVehicleForm({
                            ...vehicleForm,
                            year: y,
                          });

                          setShowYearDropdown(false);
                        }}
                      >
                        {y}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* ENGINE */}
            <div className="field select-search">
              <label>Engine</label>

              <input
                placeholder="Search engine..."
                value={engineSearch}
                onFocus={() => setShowEngineDropdown(true)}
                onChange={(e) => {
                  setEngineSearch(e.target.value);
                  setShowEngineDropdown(true);
                }}
              />

              {showEngineDropdown && (
                <div className="dropdown">
                  {engines
                    .filter((e) =>
                      `${e.name || ""} ${e.code || ""}`
                        .toLowerCase()
                        .includes(engineSearch.toLowerCase())
                    )
                    .map((e) => (
                      <div
                        key={e.id}
                        className="dropdown-item"
                        onClick={() => {
                          setVehicleForm({
                            ...vehicleForm,
                            engine_id: e.id,
                          });

                          setEngineSearch(e.name);
                          setShowEngineDropdown(false);
                        }}
                      >
                        {e.name}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* GEAR */}
            <div className="field">
              <label>Gear</label>

              <select
                value={vehicleForm.gear}
                onChange={(e) =>
                  setVehicleForm({
                    ...vehicleForm,
                    gear: e.target.value,
                  })
                }
              >
                <option value=""></option>
                <option value="auto">Automatic</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            {/* PLATE */}
            <div className="field">
              {plateError && (
                <div className="field-error">{plateError}</div>
              )}

              <label>Plate Number</label>

              <input
                placeholder="Plate Number"
                value={vehicleForm.plate_number}
                maxLength={7}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase();

                  if (!/^[A-Z]?\d{0,6}$/.test(val)) return;

                  setVehicleForm({
                    ...vehicleForm,
                    plate_number: val,
                  });

                  // live validation message
                  if (val && !/^[A-Z][0-9]{6}$/.test(val)) {
                    setPlateError("Plate must be 1 letter + 6 digits (A123456)");
                  } else {
                    setPlateError("");
                  }
                }}
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setShowVehicleModal(false)}>
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!selectedCustomer) {
                    alert("Please select a customer first");
                    return;
                  }

                  const res = await axios.post(
                    "http://localhost:5000/vehicles",
                    {
                      ...vehicleForm,
                      cust_id: selectedCustomer,
                    },
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  setShowVehicleModal(false);

                  fetchVehicles(selectedCustomer);

                  setSelectedVehicle(res.data.vehc_id);

                  setVehicleForm({
                    model_id: "",
                    year: "",
                    engine_id: "",
                    gear: "",
                    plate_number: "",
                  });

                  setModelSearch("");
                  setEngineSearch("");
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  )
}
