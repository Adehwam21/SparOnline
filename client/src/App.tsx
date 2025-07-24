import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/game-elements/board.jpg')",
      }}
    >
      <div className="font-poppins">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
