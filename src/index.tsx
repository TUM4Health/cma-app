import { ThemeProvider } from '@emotion/react';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute, { ProtectedRouteProps } from './components/authentication/ProtectedRoute';
import './index.css';
import ContentPage from './pages/content/content.page';
import DashboardPage from './pages/dashboard/dashboard.page';
import LoginPage from './pages/login/login.page';
import UsersPage from './pages/users/users.page';
import reportWebVitals from './reportWebVitals';
import { authenticationService } from './services/authentication.service';
import theme from './theme/theme';

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
          <Route path="/content/:id" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<ContentPage />} />} >
            <Route path="/content/:id/edit" element={<ProtectedRoute {...defaultProtectedRouteProps} outlet={<ContentPage />} />} >

            </Route>
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
