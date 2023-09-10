import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import Timer from './Timer';
import Ranking from './Ranking';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
// Import other components for your routes
export const RouterConfig:React.VFC=()=>{
    return (
        <Router>
            <Routes>
                <Route index element={<Home/>} />
                <Route path="timer" element={<Timer/>}/>
                <Route path="ranking" element={<Ranking/>}/>
                <Route path="register" element={<Register/>}/>
                <Route path="login" element={<Login/>}/>
                {/* Add more routes here */}
            </Routes>
        </Router>
    )
}
