import React, { useState } from 'react'
import {
  SettingOutlined,
  DatabaseOutlined,
  FileOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  CloudServerOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Layout, Menu, theme } from 'antd'

import Storage from '@/components/setting/Storage'

const { Content, Sider } = Layout

type MenuItem = Required<MenuProps>['items'][number]

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label
  } as MenuItem
}

const items: MenuItem[] = [
  getItem('首页', 'Home', <DashboardOutlined />),
  getItem('文件', 'File', <FileOutlined />),
  getItem('设置', '', <SettingOutlined />, [
    getItem('存储', 'Storage', <CloudServerOutlined />),
    getItem('元数据', 'Metadata', <DatabaseOutlined />)
  ]),
  getItem('关于', 'AboutPage', <InfoCircleOutlined />)
]

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const [currentPage, setCurrentPage] = useState('Storage')

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrentPage(e.key)
  }

  let contentPage
  switch (currentPage) {
    case '':
      break
    case 'Storage':
      contentPage = <Storage />
      break
    default:
      // contentPage = <HomePage />
      break
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          onClick={onClick}
          defaultSelectedKeys={['Home']}
          mode="inline"
          items={items}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '16' }}>
          <div
            style={{
              minHeight: '100vh',
              padding: 16,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            {contentPage}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default App
