import React from 'react'
import { InboxOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { message, Upload } from 'antd'
import { UploadRequestOption } from 'rc-upload/lib/interface'

const { Dragger } = Upload

const handleCustomRequest = (options: UploadRequestOption): void => {
  const file = options.file
  window.object.put(file.path)
  options.onSuccess?.('ok', options.file)
}

const props: UploadProps = {
  name: 'file',
  multiple: true,
  customRequest: handleCustomRequest,
  onChange(info) {
    const { status } = info.file
    if (status !== 'uploading') {
      console.log(info.file, info.fileList)
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`)
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`)
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files)
  }
}

export const File: React.FC = () => (
  <Dragger {...props}>
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">Click or drag file to this area to upload</p>
    <p className="ant-upload-hint">
      Support for a single or bulk upload. Strictly prohibited from uploading company data or other
      banned files.
    </p>
  </Dragger>
)
