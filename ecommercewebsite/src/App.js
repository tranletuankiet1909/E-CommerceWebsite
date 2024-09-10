import logo from './logo.svg';
import './App.css';
import { ContextProvider } from './configs/Contexts';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import theme from './theme';
import ProductDetails from './pages/ProductDetails';
import StoreDetails from './pages/StoreDetails';

function App() {
  return (
    <ContextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/store/:id" element={<StoreDetails />} />
          </Routes>
        </Router>

      </ThemeProvider>
    </ContextProvider>
  );
}

export default App;
