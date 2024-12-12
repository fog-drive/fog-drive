import React, { useState } from 'react'
import {
  SettingOutlined,
  DatabaseOutlined,
  FileOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  CloudServerOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Layout, Menu, theme } from 'antd'
import { Home, File, Meta, Storage, About } from '@/components'

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
  getItem('首页', 'Home', <HomeOutlined />),
  getItem('文件', 'File', <FileOutlined />),
  getItem('设置', '', <SettingOutlined />, [
    getItem('存储', 'Storage', <CloudServerOutlined />),
    getItem('元数据', 'Meta', <DatabaseOutlined />)
  ]),
  getItem('关于', 'About', <InfoCircleOutlined />)
]

const App: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const [currentPage, setCurrentPage] = useState('Home')

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrentPage(e.key)
  }

  let contentPage
  switch (currentPage) {
    case 'Home':
      contentPage = <Home />
      break
    case 'File':
      contentPage = <File />
      break
    case 'Meta':
      contentPage = <Meta />
      break
    case 'Storage':
      contentPage = <Storage />
      break
    case 'About':
      contentPage = <About />
      break
    default:
      contentPage = <Home />
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
