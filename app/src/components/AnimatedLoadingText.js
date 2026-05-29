import React, { useState, useEffect } from 'react';
import { Text } from 'react-native';

const AnimatedLoadingText = ({ text, style }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prevDots) => {
        if (prevDots.length >= 3) return '';
        return prevDots + '.';
      });
    }, 400); // 400ms interval for smooth progression

    return () => clearInterval(interval);
  }, []);

  return (
    <Text style={style}>
      {text}{dots}
    </Text>
  );
};

export default AnimatedLoadingText;
