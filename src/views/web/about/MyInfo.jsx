import React from 'react'

// components
import { Divider, Rate, Icon, Avatar } from 'antd'
import SvgIcon from '@/components/SvgIcon'
import { QqOutlined } from '@ant-design/icons'

const skills = [
  {
    label: '具备扎实的 Javascript 基础，熟练使用 ES6+ 语法。',
    rate: 4
  },
  {
    label: '熟悉 React 并理解其原理，熟悉 Vue 框架及其用法。',
    rate: 5
  },
  {
    label: '熟练使用 Webpack 打包工具，熟悉常用工程化和模块化方案。',
    rate: 4
  },
  {
    label: '熟悉 Koa、Mysql，针对需求可以做到简单的数据库设计、接口的开发与设计！',
    rate: 3
  },
  {
    label: '熟悉 HTTP 协议，缓存、性能优化、安全等，了解浏览器原理。',
    rate: 4
  },
  {
    label: '熟悉常用的算法与数据结构',
    rate: 3
  }
]

const MyInfo = () => {
  return (
    <>

      <Divider orientation='center'>关于我</Divider>

      <ul className='about-list'>
        <li>姓名：杨林</li>
        <li>本科： 集美大学(JMU)</li>
        <li>
          联系方式：
          <QqOutlined /> 494657028
          <Divider type='vertical' />
          <SvgIcon type='iconemail' style={{ marginRight: 5, transform: 'translateY(2px)' }} />
          <a href='mailto:a494657028@gmail.com'>a494657028@gmail.com</a>
        </li>
        <li>工作地：深圳</li>
        <li>
          技能
          <ul>
            {skills.map((item, i) => (
              <li key={i}>
                {item.label}
                <Rate defaultValue={item.rate} disabled />
              </li>
            ))}
          </ul>
        </li>
        <li>
          其他
          <ul>
            <li>常用开发工具： idea、pycharm、vim、vscode、webstorm、git</li>
            <li>熟悉的 UI 框架： antd、element-ui</li>
            <li>具备良好的编码风格和习惯，团队规范意识，乐于分享</li>
          </ul>
        </li>
        <li>
          个人
          <ul>
            <li>欢迎交流</li>
          </ul>
        </li>
      </ul>
    </>
  )
}

export default MyInfo
