import logo from './logo.svg';
import './App.css';
import { ContextProvider } from './configs/Contexts';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import theme from './theme';

function App() {
  return (
    <ContextProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>

      </ThemeProvider>
    </ContextProvider>
  );
}

export default App;
