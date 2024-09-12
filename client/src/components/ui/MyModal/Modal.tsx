// src/components/PostModal.tsx
import React from 'react';
import styles from './Modal.module.scss';
import {closeModal} from '@/assets/'

interface ModalProps {
  isOpen: boolean;
  setIsModalOpen: any;
  children: any;
  type: 'default' | 'image' | 'post';
}

const Modal: React.FC<ModalProps> = ({ 
    isOpen, 
    setIsModalOpen, 
    children,
    type
  }) => {

  if (!isOpen) {
    return null;
  }

  const onClose = () => {
    setIsModalOpen(!isOpen)
  }
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }
console.log(type)

  return (
    <div className={styles.modalOverlay} onClick={handleOverlayClick}>
      <div className={`modalContent ${type === 'default' ? 'defaultModal' : type === 'post' ? styles.postModal : ''}`}>
        <img src={closeModal.src} className='closeButton' onClick={onClose} />
        {children}
      </div>
    </div>
  );
};

export default Modal;
