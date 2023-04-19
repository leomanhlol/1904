import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./Home";
import ConnectWallet from "./ConnectWallet";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} exact={true} />
        <Route path="/connectwallet" element={<ConnectWallet />} exact={true} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
