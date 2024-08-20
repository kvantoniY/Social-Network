import React, { useState } from 'react';
import styles from './ImageSlider.module.scss';
import ImageModal from '../ui/ImageModal/ImageModal';

interface SliderProps {
  images: string[];
}

const ImageSlider: React.FC<SliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState('');

  const prevSlide = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const handleOpenModal = (image: string) => {
    setModalImage(image);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.sliderContainer}>
      <button className={styles.prevButton} onClick={prevSlide}>
        &#10094;
      </button>
      <div className={styles.imageContainer}>
        {images.map((image, index) => (
          <img
            key={index}
            src={`http://localhost:3001/` + image}
            alt={`Slide ${index}`}
            className={`${styles.image} ${index === currentIndex ? styles.active : ''}`}
            style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
            onClick={() => handleOpenModal(image)}
          />
        ))}
      </div>
      <button className={styles.nextButton} onClick={nextSlide}>
        &#10095;
      </button>
      <ImageModal isOpen={isOpen} setIsModalOpen={setIsModalOpen}>
        <div>
          <img src={`http://localhost:3001/` + modalImage} alt="" className={styles.img_modal} />
        </div>
      </ImageModal>
    </div>
  );
};

export default ImageSlider;
