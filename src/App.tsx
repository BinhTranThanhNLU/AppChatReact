import "./assets/css/AuthStyles.css";
import { Routes, Route, Navigate } from "react-router-dom";

import AuthContainer from "./features/AuthPages/AuthContainer";
import MessengerScreen from "./features/ChatPages/MessengerScreen";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthContainer />} />
      <Route path="/messenger" element={<MessengerScreen />} />

      {/* Mặc định vào login */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;
