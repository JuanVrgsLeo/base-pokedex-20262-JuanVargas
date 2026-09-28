import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/base.css';
import './styles/home.css';
import './styles/world.css';
import './styles/panel.css';
import './styles/card.css';

createRoot(document.getElementById('root')).render(<App />);
