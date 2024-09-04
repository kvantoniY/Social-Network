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
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sourceImages, setSourceImages] = useState<File[]>([]);
  const [sourceImagePreviews, setSourceImagePreviews] = useState<string[]>([]);
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
        formData.append('images', image);
      });
      sourceImages.forEach(sourceImage => {
        formData.append('sourceImages', sourceImage);
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
      setSourceImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createPostForm}>
      <div className={styles.inputWrapper}>
        <div
          contentEditable
          ref={contentRef}
          className={styles.textInput}
          onInput={(e) => setContent(e.currentTarget.textContent || '')}
          suppressContentEditableWarning={true}
        />
        <div className={styles.buttons}>
          <label htmlFor="fileInput" className={styles.fileButton}>
            <input
              id="fileInput"
              type="file"
              multiple
              onChange={(e) => selectFiles(e, 'meme')}
              style={{ display: 'none' }}
            />
          </label>
          <label htmlFor="sourceFileInput" className={styles.fileButton}>
            <input
              id="sourceFileInput"
              type="file"
              multiple
              onChange={(e) => selectFiles(e, 'source')}
              style={{ display: 'none' }}
            />
          </label>
          <button type="submit" className={styles.sendButton}>Отправить</button>
        </div>
      </div>

      {imagePreviews.length > 0 && (
  <div className={styles.memesContainer}>
    <h4 className={styles.previewTitle}>Мемы</h4>
    <div className={styles.previewImages}>
      {imagePreviews.map((preview, index) => (
        <div key={index} className={styles.previewWrapper}>
          <img src={preview} alt="Preview" className={styles.previewImage} />
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
  <div className={styles.sourceImagesContainer}>
    <h4 className={styles.previewTitle}>Исходные изображения</h4>
    <div className={styles.previewImages}>
      {sourceImagePreviews.map((preview, index) => (
        <div key={index} className={styles.previewWrapper}>
          <img src={preview} alt="Source Preview" className={styles.previewImage} />
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

      {status === 'loading' && <p>Отправка...</p>}
      {error && <p>{error}</p>}
    </form>
  );
};

export default CreatePost;
