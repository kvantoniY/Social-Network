import React, { useState, useEffect, useRef } from 'react';
import styles from './ImageSlider.module.scss'
import Modal from '../ui/MyModal/Modal';
import ImageModal from '../ui/ImageModal/ImageModal';

interface ImageSliderProps {
  images: string[];
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images }) => {

  const [count, setCount] = useState<number>(0);
  const sliderRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsModalOpen] = useState(false)      
    const [modalImage, setModalImage] = useState('');
  useEffect(() => {
    const updateSliderWidth = () => {
      if (!sliderRef.current) return;
      const width = sliderRef.current.offsetWidth;
      sliderRef.current.style.width = `${width * images.length}px`;
      Array.from(sliderRef.current.children).forEach((child, index) => {
        const imgElement = child as HTMLImageElement;
        imgElement.style.width = `${width}px`;
        imgElement.style.height = 'auto';
      });
    };

    window.addEventListener('resize', updateSliderWidth);
    updateSliderWidth(); // Инициализация ширины слайдера при монтировании

    return () => {
      window.removeEventListener('resize', updateSliderWidth);
    };
  }, [images]);

  const rollSlider = () => {
    if (!sliderRef.current) return;
    const width = sliderRef.current.offsetWidth / images.length;
    sliderRef.current.style.transform = `translateX(-${count * width}px)`;
  };

  useEffect(() => {
    rollSlider();
  }, [count, images]);

  const handleNextClick = () => {
    setCount(prevCount => (prevCount + 1) % images.length);
  };

  const handleBackClick = () => {
    setCount(prevCount => (prevCount - 1 + images.length) % images.length);
  };
  const handleOpenModal = (image: string) => {
    setModalImage(image)
    setIsModalOpen(true)
  }

  return (
    <div className={styles.slider}>
    <div ref={sliderRef} className={styles.slider_line}>
        {images.map((src, index) => (
        <>
          <img key={index} src={`http://localhost:3001/` + src} alt="" className={styles.img_slider} onClick={() => handleOpenModal(src)}/>
        </>
        ))}
      </div>
      <ImageModal isOpen={isOpen} setIsModalOpen={setIsModalOpen}>
            <div>
                <img src={`http://localhost:3001/` + modalImage} alt="" className={styles.img_modal} />
            </div>
       </ImageModal>
    <button className={styles.button_next} onClick={handleNextClick}>Next</button>
      <button className={styles.button_back} onClick={handleBackClick}>Back</button>
    </div>
  );
};

export default ImageSlider;
