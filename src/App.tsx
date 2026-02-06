
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { SchoolProvider } from "@/context/SchoolContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import { getUser } from "./lib/auth";
import AdminDashboard from "./components/dashboard/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SchoolProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/teacher" element={
                (getUser()?.role === 'teacher') ? <TeacherDashboard /> : <Navigate to="/login" replace />
              } />
              <Route path="/student" element={
                (getUser()?.role === 'student') ? <StudentDashboard /> : <Navigate to="/login" replace />
              } />
              <Route path="/parent" element={
                (getUser()?.role === 'parent') ? <ParentDashboard /> : <Navigate to="/login" replace />
              } />
              <Route path="/admin" element={
                (getUser()?.role === 'admin') ? <AdminDashboard /> : <Navigate to="/login" replace />
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SchoolProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
