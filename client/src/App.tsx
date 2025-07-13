import { Outlet } from "react-router-dom";
// import Header from "./components/Header";
// import Footer from "./components/Footer";

const Layout = () => {
  return (
    <div className="h-fit"
        style={{
        backgroundImage: "url('/images/game-elements/board.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="font-poppins">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
