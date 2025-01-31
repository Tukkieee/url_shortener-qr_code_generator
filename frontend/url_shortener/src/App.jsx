import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/home';
import { SignUp } from './pages/signUp';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
function App() {


  return (
    <div className="App">
    <Router>
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/login' element={<Login/>} />
        <Route path='/signUp' element={<SignUp/>} />
        <Route path='/dashboard' element={<Dashboard/>} />
        <Route path='*' element={<h1>PAGE NOT FOUND</h1>} />
      </Routes>
    </Router>
  </div>
  )
}

export default App
