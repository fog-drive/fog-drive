import React, { useState, useEffect } from 'react'
import { AppstoreAddOutlined } from '@ant-design/icons'
import { Button, Space, Table, Modal, Form, Input, message } from 'antd'
import { StorageModel } from '@shared/models'
import type { FormProps } from 'antd'
import type { TableProps } from 'antd'

type FieldType = {
  id?: number
  name?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  bucket?: string
}

type ColumnsType<T extends object> = TableProps<T>['columns']

interface DataType {
  id: number
  name: string
  type: string
  quota: number
  quotaUnit: string
}

export const Storage: React.FC = () => {
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [version, setVersion] = useState(0)

  const deleteStorage = (id: number): void => {
    window.context.deleteStorage(id)
    setVersion(version + 1)
  }

  // for ID input
  const [isIdHidden, setIsIdHidden] = useState(false)

  const showModal = (storage: DataType | null): void => {
    if (null != storage) {
      form.setFieldsValue({ id: storage.id, name: storage.name })
      setIsIdHidden(false)
    } else {
      setIsIdHidden(true)
    }
    setIsModalOpen(true)
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
          <a onClick={() => showModal(record)}>编辑</a>
          <a onClick={() => deleteStorage(record.id)}>删除</a>
        </Space>
      )
    }
  ]

  const onFinish: FormProps<FieldType>['onFinish'] = (record) => {
    const storage = record as StorageModel
    storage.type = 's3'
    window.context.saveStorage(storage)
    setIsModalOpen(false)
    setVersion(version + 1)
    message.success('ok')
  }

  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo)
  }

  const handleOk = (): void => {
    setIsModalOpen(false)
  }

  const handleCancel = (): void => {
    setIsModalOpen(false)
  }

  const [data, setData] = useState<DataType[]>([])
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const models = await window.context.getStorage()
      setData(
        models.map((model) => ({
          id: model.id,
          name: model.name,
          type: model.type,
          quota: 1000,
          quotaUnit: 'Mb'
        })) as DataType[]
      )
    }
    fetchData()
  }, [version])
  return (
    <div>
      <div style={{ padding: '16px 0px' }}>
        <Button type="primary" onClick={() => showModal(null)} icon={<AppstoreAddOutlined />}>
          添加
        </Button>
      </div>
      <Table<DataType>
        columns={columns}
        // pagination={{ position: ['bottomRight'] }}
        dataSource={data}
        style={{ width: '100vh' }}
      />
      <Modal title="存储" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={[]}>
        <Form
          name="basic"
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          {!isIdHidden && (
            <Form.Item<FieldType> label="Id" name="id" rules={[{ required: false }]}>
              <Input disabled={true} />
            </Form.Item>
          )}

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
