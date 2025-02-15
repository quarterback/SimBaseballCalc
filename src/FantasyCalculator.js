import React, { useState } from 'react';

const FantasyCalculator = () => {
  const [message, setMessage] = useState('Welcome to the Fantasy Baseball Calculator!');

  return (
    <div>
      <p>{message}</p>
    </div>
  );
};

export default FantasyCalculator;
