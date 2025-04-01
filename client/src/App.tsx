import { Outlet } from "react-router-dom";
// import Header from "./components/Header";
// import Footer from "./components/Footer";

const Layout = () => {
  return (
    <>
      {/* <Header /> */}
      <div className="min-h-screen bg-green-700 text-white">
        <Outlet />
        {/* <Footer/> */}
      </div>
    </>
  );
};

export default Layout;
