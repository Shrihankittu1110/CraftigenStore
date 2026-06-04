import { useLayoutEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './App.css';
import AddProduct from './components/AddProduct';
import AdminOrders from './components/AdminOrders';
import AdminTracking from './components/AdminTracking';
import Browse from './components/Browse';
import CartPage from './components/cart';
import Checkout from './components/Checkout';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import Home from './components/Home';
import ListProduct from './components/ListProduct';
import Login from './components/Login';
import ManageUser from './components/ManageUser';
import Navbar from './components/Navbar';
import ProductDetail from './components/ProductDetail';
import Profile from './components/Profile';
import Signup from './components/Signup';
import UpdateUser from './components/UpdateUser';
import UserOrders from './components/UserOrders';
import { CartProvider } from './contexts/CartContext';
import UserAuth from './UserAuth';
import { UserProvider } from './UserContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
};

function App() {
  return (
    <div className="app-frame">
      <Toaster position="top-center" />
      <BrowserRouter>
        <UserProvider>
          <CartProvider>
            <ScrollToTop />
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/home" />} />
              <Route path="home" element={<Home />} />
              <Route path="browse" element={<Browse />} />
              <Route path="contactus" element={<ContactUs />} />
              <Route path="login" element={<Login />} />
              <Route path="product/:source/:id" element={<ProductDetail />} />
              <Route path="profile" element={<UserAuth><Profile /></UserAuth>} />
              <Route path="admin/orders" element={<UserAuth requireAdmin><AdminOrders /></UserAuth>} />
              <Route path="admin/tracking" element={<UserAuth requireAdmin><AdminTracking /></UserAuth>} />
              <Route path="productlist" element={<UserAuth requireAdmin><ListProduct /></UserAuth>} />
              <Route path="signup" element={<Signup />} />
              <Route path="addproduct" element={<UserAuth requireAdmin><AddProduct /></UserAuth>} />
              <Route path="cart" element={<UserAuth><CartPage /></UserAuth>} />
              <Route path="checkout" element={<UserAuth><Checkout /></UserAuth>} />
              <Route path="orders" element={<UserAuth><UserOrders /></UserAuth>} />
              <Route path="manageuser" element={<UserAuth requireAdmin><ManageUser /></UserAuth>} />
              <Route path="updateuser/:id" element={<UserAuth><UpdateUser /></UserAuth>} />
            </Routes>
            <Footer />
          </CartProvider>
        </UserProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
