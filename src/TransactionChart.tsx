import React, { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

interface Transaction {
  companyId: string;
  sharesBought: number;
  totalPaid: number;
  timestamp: number;
  userId: string;
}

interface Company {
  name: string;
}

interface User {
  name: string;
}

const TransactionChart: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companies, setCompanies] = useState<Map<string, Company>>(new Map());
  const [users, setUsers] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    const transactionsRef = ref(database, '/transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setTransactions(transactionsArray);
      } else {
        setTransactions([]);
      }
    });
  }, []);

  useEffect(() => {
    const companiesRef = ref(database, '/companies');
    onValue(companiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const companiesMap = new Map<string, Company>();
        Object.keys(data).forEach((key) => {
          companiesMap.set(key, { name: data[key].name });
        });
        setCompanies(companiesMap);
      }
    });
  }, []);

  useEffect(() => {
    const usersRef = ref(database, '/users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersMap = new Map<string, User>();
        Object.keys(data).forEach((key) => {
          usersMap.set(key, { name: data[key].name });
        });
        setUsers(usersMap);
      }
    });
  }, []);

  const companyData = transactions.map((transaction) => {
    const companyName = companies.get(transaction.companyId)?.name || 'Unknown';
    const userName = users.get(transaction.userId)?.name || 'Unknown User';
    return {
      company: companyName,
      sharesBought: transaction.sharesBought,
      totalPaid: transaction.totalPaid,
      timestamp: transaction.timestamp,
      user: userName,
    };
  });

  const pieData = companyData.reduce((acc: any[], curr) => {
    const existing = acc.find((item) => item.name === curr.company);
    if (existing) {
      existing.value += curr.sharesBought;
    } else {
      acc.push({ name: curr.company, value: curr.sharesBought });
    }
    return acc;
  }, []);

  const barData = companyData.map((transaction) => ({
    name: transaction.company,
    sharesBought: transaction.sharesBought,
    totalPaid: transaction.totalPaid,
  }));

  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div style={{width: '65vw'}}>
      <h2>Company Transactions Overview</h2>
      <Button variant="contained" color="primary" onClick={handleGoBack} style={{ marginBottom: 20 }}>
        Back
      </Button>
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={150}
            fill="#8884d8"
            label
          >
            {pieData.map((index) => (
              <Cell key={`cell-${index}`} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <RechartsLegend />
          <Bar dataKey="sharesBought" fill="#8884d8" />
          <Bar dataKey="totalPaid" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TransactionChart;
