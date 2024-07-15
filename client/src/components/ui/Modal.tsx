// src/components/PostModal.tsx
import React from 'react';
import styles from './ModalPost.module.scss';


interface ModalProps {
  isOpen: boolean;
  setIsModalOpen: any;
  children: any;
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    setIsModalOpen, 
    children
  }) => {

  if (!isOpen) {
    return null;
  }

  const onClose = () => {
    setIsModalOpen(!isOpen)
  }

  return (
    <div className='modalOverlay'>
      <div className='modalContent'>
        <button className='closeButton' onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
