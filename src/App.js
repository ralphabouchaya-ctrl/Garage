import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Customers from "./pages/customers";
import Layout from "./components/Layout";
import CustomerDetails from "./pages/CustomerDetails";
import JobCard from "./pages/jobcard";
import JobCardDetails from "./pages/jobcard-details";
import InvoicePage from "./pages/invoices";
import InvoiceView from "./pages/invoiceview";
import TwoFA from "./components/TwoFA";

import ProtectedRoute from "./components/ProtectedRoute";
import Require2FA from "./components/Require2FA";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 Public */}
        <Route path="/" element={<Login />} />
        <Route path="/2fa" element={<TwoFA />} />

        {/* 🔐 Protected + 2FA required */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><Home /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><Customers /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-details/:id"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><CustomerDetails /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobcard"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><JobCard /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobcarddetails/:id"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><JobCardDetails /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><InvoiceView /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoicesdetail/:id"
          element={
            <ProtectedRoute>
              <Require2FA>
                <Layout><InvoicePage /></Layout>
              </Require2FA>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;