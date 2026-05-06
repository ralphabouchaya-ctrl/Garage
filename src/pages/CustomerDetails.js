import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./customer-details.css";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerDetails() {
    const { id } = useParams(); // cust_id

    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");
    const [showYearDropdown, setShowYearDropdown] = useState(false);
    const [models, setModels] = useState([]);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [modelSearch, setModelSearch] = useState("");
    const [engines, setEngines] = useState([]);
    const [showEngineDropdown, setShowEngineDropdown] = useState(false);
    const [engineSearch, setEngineSearch] = useState("");
    const [customer, setCustomer] = useState(null);
    const [form, setForm] = useState({
        model_id: "",
        year: "",
        engine_id: "",
        gear: "",
        plate_number: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const navigate = useNavigate();
    // Load vehicles
    const fetchEngines = async () => {
        try {
            const res = await axios.get("http://localhost:5000/engines");
            setEngines(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    const fetchCustomer = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/customers/${id}`);
            setCustomer(res.data);
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        fetchVehicles();
        fetchModels();
        fetchEngines(); // ✅ add this
        fetchCustomer();
    }, []);

    const fetchModels = async () => {
        try {
            const res = await axios.get("http://localhost:5000/models");
            setModels(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchVehicles = async () => {
        const res = await axios.get(
            `http://localhost:5000/vehicles/customer/${id}`
        );
        setVehicles(res.data);
    };

    // SEARCH vehicles
    const handleSearch = async (value) => {
        setSearch(value);

        if (!value) return fetchVehicles();

        const res = await axios.get(
            `http://localhost:5000/vehicles/search?query=${value}&cust_id=${id}`
        );
        setVehicles(res.data);
    };

    // ADD / UPDATE vehicle
    const handleSubmit = async () => {
        // ✅ REQUIRED FIELDS CHECK
        if (
            !form.model_id ||
            !form.year ||
            !form.engine_id ||
            !form.gear ||
            !form.plate_number
        ) {
            alert("Please fill all fields");
            return;
        }

        try {
            if (editId) {
                await axios.put(`http://localhost:5000/vehicles/${editId}`, form);
                alert("Vehicle updated successfully");
            } else {
                await axios.post("http://localhost:5000/vehicles", {
                    ...form,
                    cust_id: id,
                });
                alert("Vehicle added successfully");
            }

            setShowModal(false);
            setEditId(null);

            setForm({
                model: "",
                year: "",
                engine: "",
                gear: "",
                plate_number: "",
            });

            fetchVehicles();

        } catch (err) {
            // ✅ HANDLE DUPLICATE PLATE ERROR
            alert(
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Something went wrong"
            );
        }
    };
    const years = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => 1990 + i);
    const handleEdit = (v) => {
        setForm({
            model_id: v.model_id,
            year: v.year,
            engine_id: v.engine_id,
            gear: v.gear,
            plate_number: v.plate_number,
        });

        // ✅ set display values for inputs
        setModelSearch(v.model_name);
        setEngineSearch(v.engine_name);

        setEditId(v.vehc_id);
        setShowModal(true);
    };

    return (
        <div className="vehicle-container">
            <button onClick={() => navigate(-1)} className="back-btn">
                ←{customer ? `${customer.first_name} ${customer.last_name}` : "Back"}
            </button>
            {/* HEADER */}
            <div className="vehicle-header">
                <input
                    placeholder="Search vehicle..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                <button onClick={() => setShowModal(true)}>
                    + Add Vehicle
                </button>
            </div>

            {/* TABLE */}
            <table className="vehicle-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Plate</th>
                        <th>Model</th>
                        <th>Year</th>
                        <th>Engine</th>
                        <th>Gear</th>

                    </tr>
                </thead>

                <tbody>
                    {vehicles.map((v) => (
                        <tr key={v.vehc_id}>
                            <td>

                                <button
                                    className="btn-edit"
                                    onClick={() => handleEdit(v)}
                                    aria-label="Edit Customer"
                                >
                                    <Pencil size={16} />
                                </button>
                            </td>
                            <td>{v.plate_number}</td>
                            <td>{v.model_name}</td>
                            <td>{v.year}</td>

                            <td>{v.engine_name}</td>
                            <td>{v.gear}</td>


                        </tr>
                    ))}
                </tbody>
            </table>

            {/* MODAL */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">

                        <h3>{editId ? "Update Vehicle" : "Add Vehicle"}</h3>

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
                                                .includes((modelSearch || "").toLowerCase())
                                        )
                                        .map((m) => (
                                            <div
                                                key={m.id}
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setForm({ ...form, model_id: m.id });
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

                        <div className="field select-search">
                            <label>Year</label>

                            <input
                                placeholder="Search year..."
                                value={form.year}
                                onFocus={() => setShowYearDropdown(true)}
                                onChange={(e) => {
                                    setForm({ ...form, year: e.target.value });
                                    setShowYearDropdown(true);
                                }}
                            />

                            {showYearDropdown && (
                                <div className="dropdown-year">
                                    {years
                                        .filter((y) =>
                                            y.toString().includes(form.year)
                                        )
                                        .slice(0, 10)
                                        .map((y) => (
                                            <div
                                                key={y}
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setForm({ ...form, year: y });
                                                    setShowYearDropdown(false); // close on select
                                                }}
                                            >
                                                {y}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

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
                                                .includes((engineSearch || "").toLowerCase())
                                        )
                                        .map((e) => (
                                            <div
                                                key={e.id}
                                                className="dropdown-item"
                                                onClick={() => {
                                                    setForm({ ...form, engine_id: e.id });
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
                        <div className="field">
                            <label>Gear</label>
                            <select
                                value={form.gear}
                                onChange={(e) =>
                                    setForm({ ...form, gear: e.target.value })
                                }
                            >

                                <option value=""></option>
                                <option value="auto">Automatic</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                        <div className="field">

                            <label>Plate Number</label>
                            <input
                                placeholder="Plate Number"
                                value={form.plate_number}
                                onChange={(e) =>
                                    setForm({ ...form, plate_number: e.target.value })
                                }
                            />
                        </div>

                        <div className="modal-actions">
                            <button onClick={() => setShowModal(false)}>
                                Cancel
                            </button>

                            <button onClick={handleSubmit}>
                                Save
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}