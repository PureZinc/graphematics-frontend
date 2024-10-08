import GraphPage from "./pages/GraphPage";
import HomePage from "./pages/HomePage";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route element={<HomePage />} exact path="/" />
        <Route element={<GraphPage />} path="graphs/" />
      </Routes>
    </Router>
  );
}

export default App;
