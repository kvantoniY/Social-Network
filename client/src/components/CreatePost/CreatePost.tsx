import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import styles from "./CreatePost.module.scss";
import { deleteIconMini } from '../../assets/';

const CreatePost = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.posts);
  const [images, setImages] = useState<File[]>([]); // Храним массив мемов
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Храним превью мемов для отображения
  const [sourceImages, setSourceImages] = useState<File[]>([]); // Храним массив исходных изображений
  const [sourceImagePreviews, setSourceImagePreviews] = useState<string[]>([]); // Храним превью исходных изображений
  const contentRef = useRef<HTMLDivElement>(null);

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>, type: 'meme' | 'source') => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      const totalImages = images.length + selectedFiles.length;
      if (type === 'meme' && totalImages > 5) {
        alert('Вы не можете добавить больше 5 изображений.');
        return;
      }

      const selectedPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      
      if (type === 'meme') {
        setImages((prevImages) => [...prevImages, ...selectedFiles]);
        setImagePreviews((prevPreviews) => [...prevPreviews, ...selectedPreviews]);
      } else {
        setSourceImages((prevSourceImages) => [...prevSourceImages, ...selectedFiles]);
        setSourceImagePreviews((prevSourcePreviews) => [...prevSourcePreviews, ...selectedPreviews]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() || images.length > 0) {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(image => {
        formData.append('images', image); // Добавляем все мемы
      });
      sourceImages.forEach(sourceImage => {
        formData.append('sourceImages', sourceImage); // Добавляем все исходные изображения
      });
      dispatch(createPost(formData));
      setContent('');
      setImages([]);
      setImagePreviews([]);
      setSourceImages([]);
      setSourceImagePreviews([]);
      if (contentRef.current) {
        contentRef.current.textContent = '';
      }
    }
  };

  const handleDeleteImage = (index: number, type: 'meme' | 'source') => {
    if (type === 'meme') {
      setImages((prevImages) => prevImages.filter((_, i) => i !== index));
      setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    } else {
      setSourceImages((prevSourceImages) => prevSourceImages.filter((_, i) => i !== index));
      setSourceImagePreviews((prevSourcePreviews) => prevSourcePreviews.filter((_, i) => i !== index));
    }
  };

  return (
    <form onSubmit={handleSubmit} className='createPost'>
      <div
        contentEditable
        ref={contentRef}
        className='inputCreatePost'
        onInput={(e) => setContent(e.currentTarget.textContent || '')}
        suppressContentEditableWarning={true}
      />
      {imagePreviews.length > 0 && (
        <div>
          <div className={styles.imagePreviewContainer}>
            {imagePreviews.map((preview, index) => (
              <div key={index} className={styles.imagePreviewWrapper}>
                <img src={preview} alt="Preview" className={styles.imagePreview} />
                <img
                  src={deleteIconMini.src}
                  alt="Delete"
                  className={styles.deleteImage}
                  onClick={() => handleDeleteImage(index, 'meme')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {sourceImagePreviews.length > 0 && (
        <div>
          <div className={styles.imagePreviewContainer}>
            {sourceImagePreviews.map((preview, index) => (
              <div key={index} className={styles.imagePreviewWrapper}>
                <img src={preview} alt="Source Preview" className={styles.imagePreview} />
                <img
                  src={deleteIconMini.src}
                  alt="Delete"
                  className={styles.deleteImage}
                  onClick={() => handleDeleteImage(index, 'source')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <hr className={styles.separator} />
      <div className={styles.actions}>
        <label htmlFor="fileInput" className={styles.fileLabel}>
          <input
            id="fileInput"
            type="file"
            multiple // Позволяем выбирать несколько файлов для мемов
            onChange={(e) => selectFiles(e, 'meme')}
            style={{ display: 'none' }}
            className={styles.inputFile}
          />
        </label>
        <label htmlFor="sourceFileInput" className={styles.fileLabel}>
          <input
            id="sourceFileInput"
            type="file"
            multiple // Позволяем выбирать несколько файлов для исходных изображений
            onChange={(e) => selectFiles(e, 'source')}
            style={{ display: 'none' }}
            className={styles.inputFile}
          />
        </label>
        <button type="submit" className={styles.buttonPost}>Опубликовать</button>
      </div>
      {status === 'loading' && <p>Posting...</p>}
      {error && <p>{error}</p>}
    </form>
  );
};

export default CreatePost;
