import { Navigate, Route, Routes } from 'react-router-dom'

import LinkList from './LinkList'
import CreateLink from './CreateLink'
import Header from './Header'
import Login from './Login'
import Search from './Search'
import UserProfile from './UserProfile'

function App() {
  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-stone-50 shadow-xl ring-1 ring-black/5">
        <Header />
        <main className="bg-stone-50 px-4 py-5 sm:px-6">
          <Routes>
          <Route path="/" element={<Navigate to="/new/1" replace />} />
          <Route path="/submit" element={<CreateLink />} />
          <Route path="/create" element={<Navigate to="/submit" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user" element={<UserProfile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/top" element={<LinkList />} />
          <Route path="/new/:page" element={<LinkList />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App;
