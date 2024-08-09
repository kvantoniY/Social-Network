// src/components/PostModal.tsx
import React from 'react';
import styles from './ModalPost.module.scss';
import {closeModal} from '@/assets/'

interface ModalProps {
  isOpen: boolean;
  setIsModalOpen: any;
  children: any;
}

const ImageModal: React.FC<ModalProps> = ({ 
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
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className='modalOverlay' onClick={handleOverlayClick}>
      <div className='imageModalContent'>
        <img src={closeModal.src} className='closeButton' onClick={onClose} />
        {children}
      </div>
    </div>
  );
};

export default ImageModal;
