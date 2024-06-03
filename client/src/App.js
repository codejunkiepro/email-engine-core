import React from 'react';
import AddAccount from './components/AddAccount';
import EmailList from './components/EmailList';
import './App.css'

const App = () => {
  return (
    <div>
      <h1>Email Engine</h1>
      <AddAccount />
      <EmailList />
    </div>
  );
};

export default App;