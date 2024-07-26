import React from 'react';
import Dialog from '../../components/Dialog/Dialog';
import { useRouter } from 'next/router';

const DialogPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  return (
    <div>
      <Dialog />
    </div>
  );
};

export default DialogPage;
