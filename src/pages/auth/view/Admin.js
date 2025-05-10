import React from 'react';
import MainLayout from '../../../context/MainLayout';
import AdminNavbar from '../../../components/navbar/NavbarAdmin';
import RoomManagement from '../admin/Admin';

const Admin = () => {
  return (
    <MainLayout navbar={AdminNavbar}>
      <RoomManagement />
    </MainLayout>
  );
};

export default Admin; 