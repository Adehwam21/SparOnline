import { Outlet } from "react-router-dom";
import Header from "./components/Header";
// import Footer from "./components/Footer";

const Layout = () => {
  return (
    <div className="h-full bg-green-600">
      <Header />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
