import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import UsersTable from './UsersTable';
import TransactionChart from './TransactionChart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UsersTable />} />
        <Route path="/charts" element={<TransactionChart />} />
      </Routes>
    </Router>
  );
}

export default App;
