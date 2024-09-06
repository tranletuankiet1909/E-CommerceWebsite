//import logo from './logo.svg';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import './App.css';
import Register from './pages/Register';
import { ContextProvider } from './configs/Contexts';
import { ThemeProvider } from '@emotion/react';
import theme from './theme';
import { CssBaseline } from '@mui/material';
import { useEffect } from 'react';

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
            <Route path="/register/" element={<Register />} />
          </Routes>
        </Router>

      </ThemeProvider>
    </ContextProvider>
  );
}

export default App;