import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./customer-details.css";
import { Pencil } from "lucide-react";

export default function CustomerDetails() {
    const { id } = useParams(); // cust_id

    const [vehicles, setVehicles] = useState([]);
    const [search, setSearch] = useState("");

    const [form, setForm] = useState({
        model: "",
        year: "",
        engine: "",
        gear: "",
        plate_number: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    // Load vehicles
    useEffect(() => {
        fetchVehicles();
    }, []);

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
        if (editId) {
            await axios.put(
                `http://localhost:5000/vehicles/${editId}`,
                form
            );
        } else {
            await axios.post("http://localhost:5000/vehicles", {
                ...form,
                cust_id: id,
            });
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
    };

    const handleEdit = (v) => {
        setForm(v);
        setEditId(v.vehc_id);
        setShowModal(true);
    };

    return (
        <div className="vehicle-container">

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
                            <td>{v.model}</td>
                            <td>{v.year}</td>
                            <td>{v.engine}</td>
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

                        <input
                            placeholder="Model"
                            value={form.model}
                            onChange={(e) =>
                                setForm({ ...form, model: e.target.value })
                            }
                        />

                        <input
                            placeholder="Year"
                            value={form.year}
                            onChange={(e) =>
                                setForm({ ...form, year: e.target.value })
                            }
                        />

                        <input
                            placeholder="Engine"
                            value={form.engine}
                            onChange={(e) =>
                                setForm({ ...form, engine: e.target.value })
                            }
                        />

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
                        <input
                            placeholder="Plate Number"
                            value={form.plate_number}
                            onChange={(e) =>
                                setForm({ ...form, plate_number: e.target.value })
                            }
                        />

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