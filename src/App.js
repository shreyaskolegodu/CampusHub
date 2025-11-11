import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const Notices = lazy(() => import("./pages/Notices"));
const Forum = lazy(() => import("./pages/Forum"));
const Post = lazy(() => import("./pages/Post"));
const Resources = lazy(() => import("./pages/Resources"));
const Upload = lazy(() => import("./pages/Upload"));
const Contact = lazy(() => import("./pages/Contact"));
const ProfileAbout = lazy(() => import("./pages/ProfileAbout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function AppContent() {
  const location = useLocation();
  const hideNav = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!hideNav && <Navbar />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28 }} style={{ minHeight: '60vh' }}>
          <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
            <Routes location={location}>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notices"
            element={
              <ProtectedRoute>
                <Notices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <Forum />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum/:id"
            element={
              <ProtectedRoute>
                <Post />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/about"
            element={
              <ProtectedRoute>
                <ProfileAbout />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
            </Routes>
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
