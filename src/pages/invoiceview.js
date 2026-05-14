import React, { useEffect, useState } from "react";
import "./invoice-view.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, Trash2 } from "lucide-react";

export default function InvoiceView() {
    const [jobCards, setJobCards] = useState([]);
    const [statusFilter, setStatusFilter] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [showJobModal, setShowJobModal] = useState(false);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [customers, setCustomers] = useState([]);
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const [vehicleSearch, setVehicleSearch] = useState("");
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
    const total = tasks.reduce((sum, t) => sum + Number(t.fees || 0), 0)
    const [vehicleForm, setVehicleForm] = useState({
        model: "",
        year: "",
        engine: "",
        gear: "",
        plate_number: "",
    });

    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    useEffect(() => {
        fetchJobCards(statusFilter, dateFilter);
    }, [statusFilter, dateFilter]);
    // ================= FETCH =================



    // ================= STATUS =================
    const getStatusClass = (status) => {
        switch (status) {
            case "not_started":
                return "status not";

            case "in_progress":
                return "status progress";

            case "completed":
                return "status done";

            case "Cashed":
                return "status invoiced";

            default:
                return "status";
        }
    };




    const fetchJobCards = async (status = statusFilter, date = dateFilter) => {
        try {
            const res = await axios.get("http://localhost:5000/getinvoices", {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    status,
                    date,
                },
            });

            setJobCards(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setJobCards([]);
        }
    };
   const filteredJobCards = jobCards.filter((job) => {
    const value = search.toLowerCase();

    return (
        job.vehicle?.toLowerCase().startsWith(value) ||
        job.customer?.toLowerCase().startsWith(value)
       
    );
});
    return (
        <div className="jobcard-container">
            <div className="header">

                <input
                    placeholder="Search card..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* STATUS FILTER */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="Cashed">Cashed</option>
                </select>

                {/* DATE FILTER */}
                <div className="field full">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />
                </div>


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
                        filteredJobCards.map((job) => (
                            <tr key={job.job_card_id}>
                                <td>
                                    <div className="action-buttons">



                                        <button
                                            className="btn-view"
                                            onClick={() =>
                                                navigate(`/invoicesdetail/${job.job_card_id}`)
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

                                    setSelectedCustomer(res.data.cust_id);


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
            {showVehicleModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Add Vehicle</h3>

                        <input
                            placeholder="Model"
                            value={vehicleForm.model}
                            onChange={(e) =>
                                setVehicleForm({ ...vehicleForm, model: e.target.value })
                            }
                        />

                        <input
                            placeholder="Year"
                            value={vehicleForm.year}
                            onChange={(e) =>
                                setVehicleForm({ ...vehicleForm, year: e.target.value })
                            }
                        />

                        <input
                            placeholder="Engine"
                            value={vehicleForm.engine}
                            onChange={(e) =>
                                setVehicleForm({ ...vehicleForm, engine: e.target.value })
                            }
                        />

                        <select
                            value={vehicleForm.gear}
                            onChange={(e) =>
                                setVehicleForm({ ...vehicleForm, gear: e.target.value })
                            }
                        >
                            <option value="">Select Gear</option>
                            <option value="auto">Automatic</option>
                            <option value="manual">Manual</option>
                        </select>

                        <input
                            placeholder="Plate Number"
                            value={vehicleForm.plate_number}
                            onChange={(e) =>
                                setVehicleForm({
                                    ...vehicleForm,
                                    plate_number: e.target.value,
                                })
                            }
                        />

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
                                        { headers: { Authorization: `Bearer ${token}` } }
                                    );

                                    setShowVehicleModal(false);

                                    setSelectedVehicle(res.data.vehc_id);

                                    setVehicleForm({
                                        model: "",
                                        year: "",
                                        engine: "",
                                        gear: "",
                                        plate_number: "",
                                    });
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
