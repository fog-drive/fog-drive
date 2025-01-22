import React, { useState } from 'react'
import { PlusOutlined, FileImageOutlined } from '@ant-design/icons'
import { Flex, Button, Upload, message } from 'antd'
import type { UploadProps, UploadFile } from 'antd'
import { UploadRequestOption } from 'rc-upload/lib/interface'

interface FileItem extends UploadFile {
  name: string
}

interface CustomFile extends File {
  path: string
}

const handleCustomRequest = (options: UploadRequestOption): void => {
  const file = options.file as CustomFile
  window.object.put(file.path)
  options.onSuccess?.('ok', file)
}

export const File: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([])

  const props: UploadProps = {
    name: 'file',
    multiple: true,
    customRequest: handleCustomRequest,
    showUploadList: false,
    onChange(info) {
      const { status } = info.file
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`)
        setFiles((prev) => [...prev, info.file as FileItem])
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    }
  }

  return (
    <Flex gap="middle" vertical={false}>
      {files.map((file, index) => (
        <div
          key={index}
          style={{
            width: '96px',
            height: '96px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <FileImageOutlined style={{ fontSize: '48px' }} />
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              wordBreak: 'break-word',
              lineHeight: '1.2',
              maxWidth: '96px'
            }}
          >
            {file.name}
          </div>
        </div>
      ))}

      <Upload {...props}>
        <div
          style={{
            width: '96px',
            height: '96px',
            display: 'flex',
            border: '1px dashed #d9d9d9',
            borderRadius: '8px',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer'
          }}
        >
          <PlusOutlined style={{ fontSize: '48px' }} />
          <div
            style={{
              marginTop: '8px',
              fontSize: '12px',
              wordBreak: 'break-word',
              lineHeight: '1.2',
              maxWidth: '96px'
            }}
          >
            添加
          </div>
        </div>
      </Upload>
    </Flex>
  )
}
