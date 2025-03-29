import './App.css';
import { Toaster } from 'react-hot-toast';
import { Outlet } from 'react-router-dom';


function App() {
  return (
    <>
      <Toaster />
      <div>
        <Outlet />
      </div>
    </>
  );
}

export default App;
