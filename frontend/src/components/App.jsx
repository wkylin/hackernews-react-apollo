import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom'
import '../styles/App.css';

import LinkList from './LinkList.jsx'
import CreateLink from './CreateLink.jsx'
import Header from './Header.jsx'
import Login from './Login.jsx'
import Search from './Search.jsx'

function App() {
  return (
    <div className="center w85">
      <Header />
      <div className="ph3 pv1 background-gray">
        <Routes>
          <Route path="/" element={<Navigate to="/new/1" replace />} />
          <Route path="/create" element={<CreateLink />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
          <Route path="/top" element={<LinkList />} />
          <Route path="/new/:page" element={<LinkList />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
