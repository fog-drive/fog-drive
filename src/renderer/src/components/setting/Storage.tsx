import React, { useState } from 'react'
import { AppstoreAddOutlined } from '@ant-design/icons'
import { Button, Space, Table, Modal, Form, Input, message } from 'antd'
import { StorageModel } from '@shared/models'
import type { FormProps } from 'antd'
import type { TableProps } from 'antd'

type FieldType = {
  name?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  bucket?: string
}

type ColumnsType<T extends object> = TableProps<T>['columns']

interface DataType {
  name: string
  type: string
  quota: number
  quotaUnit: string
}

const columns: ColumnsType<DataType> = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type'
  },
  {
    title: '配额',
    dataIndex: 'quota',
    key: 'quota',
    render: (_, record): JSX.Element => {
      return (
        <>
          {record.quota} {record.quotaUnit}
        </>
      )
    }
  },
  {
    title: '操作',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>编辑 {record.name}</a>
        <a>删除</a>
      </Space>
    )
  }
]

const data: DataType[] = [
  {
    name: '青云',
    type: 's3',
    quota: 1000,
    quotaUnit: 'Mb'
  },
  {
    name: '七牛',
    type: 's3',
    quota: 1000,
    quotaUnit: 'Mb'
  }
]

const AddButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    const storage = values as StorageModel
    storage.type = 's3'
    window.context.addStorage(storage)
    setIsModalOpen(false)
    message.success(JSON.stringify(storage))
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }
  const addStorage = (): void => {
    setIsModalOpen(true)
  }

  const handleOk = (): void => {
    setIsModalOpen(false)
  }

  const handleCancel = (): void => {
    setIsModalOpen(false)
  }

  return (
    <div style={{ padding: '16px 0px' }}>
      <Button type="primary" onClick={addStorage} icon={<AppstoreAddOutlined />}>
        添加
      </Button>
      <Modal title="存储" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={[]}>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            label="名称"
            name="name"
            rules={[{ required: true, message: '请输入名称!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Access Key"
            name="accessKey"
            rules={[{ required: true, message: '请输入Access Key!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Secret Key"
            name="secretKey"
            rules={[{ required: true, message: '请输入Secret Key!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item<FieldType>
            label="Endpoint"
            name="endpoint"
            rules={[{ required: true, message: '请输入Endpoint!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Bucket"
            name="bucket"
            rules={[{ required: true, message: '请输入Bucket!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

const Storage: React.FC = () => {
  return (
    <div>
      <AddButton />
      <Table<DataType>
        columns={columns}
        pagination={{ position: ['bottomRight'] }}
        dataSource={data}
        style={{ width: '100vh' }}
      />
    </div>
  )
}

export default Storage
