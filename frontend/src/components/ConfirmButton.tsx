import { useState } from 'react';
import { Button, Popconfirm } from 'antd';
import {DeleteOutlined} from '@ant-design/icons';

function ConfirmButton() {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);

    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    console.log('Clicked cancel button');
    setOpen(false);
  };

  return (
    <Popconfirm
      title="删除确认"
      description="确认要删除所有对话历史么？"
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      <Button type="text" onClick={showPopconfirm} ghost block icon={<DeleteOutlined />}>
        删除历史
      </Button>
    </Popconfirm>
  );
}

export default ConfirmButton;