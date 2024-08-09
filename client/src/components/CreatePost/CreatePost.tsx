import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import styles from "./CreatePost.module.scss";
import { deleteIconMini } from '../../assets/'

const CreatePost = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.posts);
  const [images, setImages] = useState<File[]>([]); // Храним массив изображений
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // Храним превью для отображения
  const contentRef = useRef<HTMLDivElement>(null);

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...selectedFiles]);
      const selectedPreviews = selectedFiles.map(file => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...selectedPreviews]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const formData = new FormData();
      formData.append('content', content);
      images.forEach(image => {
        formData.append('images', image); // Добавляем все изображения
      });
      dispatch(createPost(formData));
      setContent('');
      setImages([]);
      setImagePreviews([]);
      if (contentRef.current) {
        contentRef.current.textContent = '';
      }
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
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
                  onClick={() => handleDeleteImage(index)}
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
            multiple // Позволяем выбирать несколько файлов
            onChange={selectFiles}
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
