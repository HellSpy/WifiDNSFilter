import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Blocklist = () => {
  const [blocklist, setBlocklist] = useState([]);
  const [newDomain, setNewDomain] = useState('');

  useEffect(() => {
    fetchBlocklist();
  }, []);

  const fetchBlocklist = async () => {
    try {
      const response = await axios.get('/api/blocklist'); // Correct endpoint
      setBlocklist(response.data);
    } catch (error) {
      console.error('Error fetching blocklist', error);
    }
  };

  const addDomain = async () => {
    try {
      await axios.post('/api/add_blocklist', { domain: newDomain }); // Correct endpoint
      fetchBlocklist();
      setNewDomain('');
    } catch (error) {
      console.error('Error adding domain', error);
    }
  };

  const removeDomain = async (domain) => {
    try {
      await axios.post('/api/remove_blocklist', { domain }); // Correct endpoint
      fetchBlocklist();
    } catch (error) {
      console.error('Error removing domain', error);
    }
  };

  return (
    <div>
      <h2>Blocklist</h2>
      <ul>
        {blocklist.map((domain) => (
          <li key={domain}>
            {domain} <button onClick={() => removeDomain(domain)}>Remove</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newDomain}
        onChange={(e) => setNewDomain(e.target.value)}
        placeholder="Add domain to blocklist"
      />
      <button onClick={addDomain}>Add</button>
    </div>
  );
};

export default Blocklist;
