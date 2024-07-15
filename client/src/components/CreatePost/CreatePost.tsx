import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPost } from '../../features/posts/postsSlice';
import { RootState, AppDispatch } from '../../store/store';
import styles from "./CreatePost.module.scss";

const CreatePost = () => {
  const [content, setContent] = useState('');
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.posts);
  const [image, setImage] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }
      dispatch(createPost(formData));
      setContent('');
      setImage(null);
      setImagePreview(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='createPost'>
      <div
        contentEditable
        className={styles.textarea}
        onInput={(e) => setContent(e.currentTarget.textContent || '')}
        suppressContentEditableWarning={true}
      />
      {imagePreview && <img src={imagePreview} alt="Preview" className={styles.imagePreview} />}
      <hr className={styles.separator} />
      <div className={styles.actions}>
        <label htmlFor="fileInput" className={styles.fileLabel}>
          <input
            id="fileInput"
            type="file"
            onChange={selectFile}
            style={{ display: 'none' }}
            className={styles.inputFile}
          />
        </label>
        <button type="submit" className={styles.buttonPost}>Post</button>
      </div>
      {status === 'loading' && <p>Posting...</p>}
      {error && <p>{error}</p>}
    </form>
  );
};

export default CreatePost;
