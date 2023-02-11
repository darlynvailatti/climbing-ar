import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
import AppContextWrapper from './AppContext';
import Backstage from './Game/Backstage';
import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import Stage from './Game/Stage';
import Lab from './Lab/Lab';

const darkTheme = createTheme({
  palette: {

  },
});

const router = createBrowserRouter([
  {
    path: '/backstage',
    element: <Backstage/>
  },
  {
    path: '/stage',
    element: <Stage/>
  },
  {
    path: '/lab',
    element: <Lab/>
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
