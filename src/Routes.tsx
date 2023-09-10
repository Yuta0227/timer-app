import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import App from './App';
// Import other components for your routes
export const RouterConfig:React.VFC=()=>{
    return (
        <Router>
            <Routes>
                <Route index element={<Home/>} />
                <Route path="timer" element={<App/>}/>
                {/* Add more routes here */}
            </Routes>
        </Router>
    )
}
