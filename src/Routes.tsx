import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Timer from './Timer';
// Import other components for your routes
export const RouterConfig:React.VFC=()=>{
    return (
        <Router>
            <Routes>
                <Route index element={<Home/>} />
                <Route path="timer" element={<Timer/>}/>
                {/* Add more routes here */}
            </Routes>
        </Router>
    )
}
