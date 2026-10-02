import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '80px 24px', textAlign: 'center' }}>
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the requested page or enterprise module does not exist."
        extra={
          <Button type="primary" onClick={() => navigate('/')} style={{ borderRadius: 8 }}>
            Return to Dashboard
          </Button>
        }
      />
    </div>
  );
};

export default NotFound;
