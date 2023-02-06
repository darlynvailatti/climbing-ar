import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
import AppContextWrapper from './AppContext';
import GameComponent from './Game/GameComponent';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Backstage from './Game/Backstage';

const darkTheme = createTheme({
  palette: {

  },
});

const router = createBrowserRouter([
  {
    path: '/stage',
    element: <GameComponent/>
  },
  {
    path: '/backstage',
    element: <Backstage/>
  }
])

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AppContextWrapper>
        <RouterProvider router={router} />
      </AppContextWrapper>
    </ThemeProvider>
  )
}

export default App;
