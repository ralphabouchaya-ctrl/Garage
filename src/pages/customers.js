import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./customers.css";
import { Eye, Pencil } from 'lucide-react';
export default function Customers() {
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    const navigate = useNavigate();

    // Load data on mount
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        const res = await axios.get('http://localhost:5000/customers');
        setCustomers(res.data);
    };

    const handleSearch = async (value) => {
        setSearch(value);

        if (value === '') {
            return fetchCustomers();
        }

        const res = await axios.get(
            `http://localhost:5000/customers/search?query=${value}`
        );
        setCustomers(res.data);
    };

    const handleSubmit = async () => {
        if (editId) {
            await axios.put(
                `http://localhost:5000/customers/${editId}`,
                form
            );
        } else {
            await axios.post(
                'http://localhost:5000/customers',
                form
            );
        }

        setShowModal(false);
        setEditId(null);
        setForm({
            first_name: '',
            last_name: '',
            email: '',
            phone: ''
        });

        fetchCustomers();
    };

    const handleEdit = (cust) => {
        setForm(cust);
        setEditId(cust.cust_id);
        setShowModal(true);
    };

    return (
        <div className="container">
            <div className="header">
                <input
                    placeholder="Search customer..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                />

                <button onClick={() => setShowModal(true)}>
                    + Add Customer
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th></th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Email</th>

                    </tr>
                </thead>

                <tbody>
                    {customers.map((c) => (
                        <tr key={c.cust_id}>
                            <td>
                                <div className="action-buttons">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(c)}
                                        aria-label="Edit Customer"
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        className="btn-view"
                                        onClick={() => navigate(`/customer-details/${c.cust_id}`)}
                                        aria-label="View Details"
                                    >
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </td>
                            <td>{c.first_name}</td>
                            <td>{c.last_name}</td>
                            <td>{c.phone}</td>
                            <td>{c.email}</td>

                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>{editId ? 'Update' : 'Add'} Customer</h3>

                        <input
                            placeholder="First Name"
                            value={form.first_name}
                            onChange={(e) =>
                                setForm({ ...form, first_name: e.target.value })
                            }
                        />

                        <input
                            placeholder="Last Name"
                            value={form.last_name}
                            onChange={(e) =>
                                setForm({ ...form, last_name: e.target.value })
                            }
                        />

                        <input
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) =>
                                setForm({ ...form, email: e.target.value })
                            }
                        />

                        <input
                            placeholder="Phone"
                            value={form.phone}
                            onChange={(e) =>
                                setForm({ ...form, phone: e.target.value })
                            }
                        />

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-save" onClick={handleSubmit}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}