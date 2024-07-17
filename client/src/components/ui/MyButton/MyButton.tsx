import React, { ReactNode } from "react";
import style from "./MyButton.module.css";

interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const MyButton: React.FC<MyButtonProps> = ({ children, ...props }) => {
  return (
    <button className={style.btn} {...props}>
      <span>{children}</span>
    </button>
  );
};

export default MyButton;
