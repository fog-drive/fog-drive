import React from 'react'
import type { FormProps } from 'antd'
import { Button, Form, Input } from 'antd'

type FieldType = {
  name?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  bucket?: string
}

const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
  console.log('Success:', values)
}

const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
  console.log('Failed:', errorInfo)
}

const Storage: React.FC = () => (
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
      <Input.Password />
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
)

export default Storage
