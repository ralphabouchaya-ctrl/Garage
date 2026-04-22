import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Customers from "./pages/customers";
import Layout from "./components/Layout";
import CustomerDetails from "./pages/CustomerDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login WITHOUT navbar */}
        <Route path="/" element={<Login />} />

        {/* All pages WITH navbar */}
        <Route
          path="/home"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />

        <Route
          path="/customers"
          element={
            <Layout>
              <Customers />
            </Layout>
          }
        />

        
        <Route
          path="/customer-details/:id"
          element={
            <Layout>
              <CustomerDetails />
            </Layout>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;