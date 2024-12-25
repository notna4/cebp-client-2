import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { AdminPanelSettingsRounded, ContentCopy } from '@mui/icons-material';
import { database } from './firebase';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  blocked: boolean;
  budget: number;
  status: string;
  password: string;
}

type Order = 'asc' | 'desc';

const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof User>('name');
  const [highlightedRow, setHighlightedRow] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const usersRef = ref(database, '/users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setUsers(usersArray);
      } else {
        setUsers([]);
      }
    });
  }, []);

  const handleSort = (property: keyof User) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === 'asc' ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const highlightRow = (id: string) => {
    setHighlightedRow(id);
    setTimeout(() => setHighlightedRow(null), 1000);
  };

  const toggleBlocked = (id: string, blocked: boolean) => {
    const userRef = ref(database, `/users/${id}`);
    update(userRef, { blocked: !blocked });
    highlightRow(id);
  };

  const toggleStatus = (id: string, status: string) => {
    const userRef = ref(database, `/users/${id}`);
    update(userRef, { status: status === 'admin' ? 'user' : 'admin' });
    highlightRow(id);
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleFieldChange = (field: keyof User, value: string | boolean) => {
    if (selectedUser) {
      setSelectedUser({ ...selectedUser, [field]: value });
    }
  };

  const saveChanges = () => {
    if (selectedUser) {
      const userRef = ref(database, `/users/${selectedUser.id}`);
      update(userRef, {
        name: selectedUser.name,
        email: selectedUser.email,
        password: selectedUser.password,
      });
      closeModal();
    }
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id).then(() => {
      alert('User ID copied to clipboard!');
    }).catch(err => {
      alert('Failed to copy text: ' + err);
    });
  };

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  const navigate = useNavigate();

  const handleGoToCharts = () => {
    navigate('/charts');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Button variant="contained" color="primary" onClick={handleGoToCharts} style={{ marginBottom: 20 }}>
        Go to Charts
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow
                key={user.id}
                style={{
                  backgroundColor:
                    highlightedRow === user.id
                      ? '#00c853'
                      : hoveredRow === user.id
                      ? 'rgba(0, 128, 0, 0.1)' 
                      : user.blocked
                      ? 'rgba(128, 128, 128, 0.2)'
                      : 'inherit',
                  transition: 'backgroundColor 0.3s ease-in-out',
                  cursor: 'pointer',
                }}
                onClick={() => openModal(user)}
                onMouseEnter={() => setHoveredRow(user.id)} 
                onMouseLeave={() => setHoveredRow(null)} 
              >
                <TableCell>
                  {user.status === 'admin' ? (
                    <AdminPanelSettingsRounded style={{ color: 'gold' }} /> 
                  ) : (
                    ''
                  )}
                <ContentCopy
                style={{ marginLeft: 8, cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(user.id); 
                }}
                />
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={user.blocked ? 'secondary' : 'primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBlocked(user.id, user.blocked);
                    }}
                  >
                    {user.blocked ? 'Unblock' : 'Block'}
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    style={{ marginLeft: 8 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStatus(user.id, user.status);
                    }}
                  >
                    {user.status === 'admin' ? 'Set to User' : 'Set to Admin'}
                  </Button>
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={closeModal}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={selectedUser?.name || ''}
            onChange={(e) => handleFieldChange('name', e.target.value)}
          />
          <TextField
            label="Email"
            fullWidth
            margin="dense"
            value={selectedUser?.email || ''}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
          <TextField
            label="Password"
            fullWidth
            margin="dense"
            type="password"
            onChange={(e) => handleFieldChange('password', e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal} color="secondary">
            Cancel
          </Button>
          <Button onClick={saveChanges} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default UsersTable;
