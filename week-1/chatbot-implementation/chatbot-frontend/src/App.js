import './App.css';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>IT SUPPORT BOT</h1>
      </header>
      <div className="main-content">
        <Chat />
      </div>
    </div>
  );
}

export default App;
