import { createTheme, ThemeProvider } from '@mui/material';
import './App.css';
import AppContextWrapper from './AppContext';
import GameComponent from './Game/GameComponent';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AppContextWrapper>
        <GameComponent></GameComponent>
      </AppContextWrapper>
    </ThemeProvider>
  )
}

export default App;
