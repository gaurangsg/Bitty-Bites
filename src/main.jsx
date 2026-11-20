import React from 'react';
import { createRoot } from 'react-dom/client';
import 'swiper/css';
import 'swiper/css/pagination';
import '../css/style.css';
import '../css/auth.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
