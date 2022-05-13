import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import theme from './theme/theme';
import LoginPage from './pages/login/login.page';
import ProtectedRoute, { ProtectedRouteProps } from './components/authentication/ProtectedRoute';
import { authenticationService } from './services/authentication.service';
import DashboardPage from './pages/dashboard/dashboard.page';
import UsersPage from './pages/users/users.page';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const defaultProtectedRouteProps: Omit<ProtectedRouteProps, 'outlet'> = {
  isAuthenticated: authenticationService.currentUser != null,
  authenticationPath: '/login',
};


root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<DashboardPage />} />} />
          <Route path='/users' element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<UsersPage />} />} />
          <Route path="login" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
