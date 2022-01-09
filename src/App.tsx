import './App.css';
import AppContextWrapper from './AppContext';
import GameComponent from './Game/GameComponent';

function App() {
  return (
    <AppContextWrapper>
      <GameComponent></GameComponent>
    </AppContextWrapper>
  )
}

export default App;
