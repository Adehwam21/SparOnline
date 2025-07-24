import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/LandingPage';
import LearnPage from '../pages/Learn';
import Play from '../pages/Play/Play';
import GamePage from '../pages/Game';
import { RoomProvider } from '../contexts/roomContext';


export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      {  path:"/play", element: <Play /> },
      { path:"/learn", element: <LearnPage /> },
      { path:"/game/:id", element: (
        <RoomProvider>
          <GamePage/>
        </RoomProvider>
        
      )}
    ],
  },
]);
