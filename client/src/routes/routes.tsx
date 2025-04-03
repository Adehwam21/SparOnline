import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LandingPage from '../pages/Lobby';
import LearnPage from '../pages/Learn';
import Lobby from '../components/Lobby/Lobby';
import GamePage from '../pages/Game';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Lobby /> },
      {  path:"/sign-in", element: <LandingPage /> },
      { path:"/learn", element: <LearnPage /> },
      { path:"/game", element: <GamePage/>}
    ],
  },
]);
