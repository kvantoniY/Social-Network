import React from 'react';

interface MyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const MyInput: React.FC<MyInputProps> = (props) => {
  return (
    <input {...props} />
  )
}

export default MyInput;
