import GraphPage from "./pages/GraphPage";
import GraphDetail from "./pages/GraphDetail";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
import Navbar from "./components/Navbar";
import BuildGraph from "./pages/BuildGraph";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<HomePage />} exact path="/" />
        <Route element={<GraphPage />} path="graphs/" />
        <Route element={<GraphDetail />} path="graphs/:id/" />
        <Route element={<LoginPage />} path="login/" />
        {/* <Route element={<RegisterPage />} path="register/" /> */}
        <Route element={<BuildGraph />} path="create/" />
        <Route element={<BuildGraph />} path="create/:id/" />
      </Routes>
    </Router>
  );
}

export default App;
