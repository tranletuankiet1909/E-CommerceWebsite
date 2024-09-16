import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import ProductDetails from './pages/ProductDetails';
import StoreDetails from './pages/StoreDetails';
import Cart from './pages/Cart';
import { ContextProvider } from './configs/Contexts';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import { CssBaseline } from '@mui/material';

function App() {
  // useEffect(() => {
  //   console.log(theme); // Thêm dòng này để kiểm tra giá trị của theme
  // }, []);
  return (
    <ContextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/store/:id" element={<StoreDetails />} />
            <Route path="/carts/" element={<Cart />} />
            <Route path="/register/" element={<Register />} />
            <Route path="/login/" element={<Login />} />
            <Route path="/profile/" element={<Profile />} />
            <Route path="/orders/" element={<Orders />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ContextProvider>
  );
}

export default App;