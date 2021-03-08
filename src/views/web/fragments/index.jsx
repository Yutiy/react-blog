import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css'
import { Comment, Tooltip, List, Card, Avatar } from 'antd'
import axios from '@/utils/axios'
import useAjaxLoading from '@/hooks/useAjaxLoading'
import dayjs from '@/utils/dayjs'
import { RandomId } from 'utils'

const { Meta } = Card

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1000
}

function FragmentList(props) {
  const [loading, withLoading] = useAjaxLoading()

  const [fragment, setFragment] = useState([])

  useEffect(() => {
    withLoading(axios.get(`/fragment`))
      .then(res => {
        // console.log(moment('2020-12-06T04:00:00.000Z').format('MMMM Do YYYY, h:mm:ss a'))
        setFragment(res.rows)
      })
      .catch(e => {
        console.log(e)
        props.history.push('/404')
      })
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
      <img
        alt='今日诗词'
        src='https://v2.jinrishici.com/one.svg'
        style={{
          height: '30px',
          margin: 'auto'
        }}></img>
      <List
        // grid={{
        //   gutter: 16,
        //   xs: 1,
        //   sm: 2,
        //   md: 4,
        //   lg: 4,
        //   xl: 6,
        //   xxl: 3,
        // }}
        size={'large'}
        header={`闲言 【${fragment.length}】`}
        dataSource={fragment}
        split={true}
        style={{width: '80%', marginTop: '5%', alignSelf: 'center'}}
        renderItem={item => (
          <List.Item key={item.title} style={{width: '100%'}}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%' }}>
              {/* <List.Item.Meta
                style={{ display: 'flex', flexDirection: 'row'}}
                avatar={<Avatar src={'https://www.ytxcloud.com/static/media/avatar.7e58ba1b.jpeg'} />}
                title={'Yutiy'}
                description={dayjs(item.createdAt, 'YYYYMMDD', 'zh-cn').fromNow()}
              /> */}
              <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <p style={{justifySelf: 'flex-start', marginLeft: '3%', fontFamily: 'Comic Sans MS', fontSize: 15}}>{item.content}</p>
                <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                  <div style={{display: 'flex', flexDirection: 'row'}}>
                    <Avatar style={{marginRight: '10px'}} src={'https://www.ytxcloud.com/static/media/avatar.7e58ba1b.jpeg'} />
                    <p style={{margin: 'auto', fontSize: 13}}>Yutiy</p>
                  </div>
                  <div style={{display: 'flex', justifySelf: 'flex-end', alignSelf: 'flex-end', fontSize: 8}}>{dayjs(item.createdAt, 'YYYYMMDDHHmmss', 'zh-cn').format('YYYY-MM-DD HH:mm:ss') }</div>
                </div>
              </div>
            </div>
          </List.Item>
          // <List.Item>
          //   <Card
          //     style={{ width: 300 }}
          //     // cover={
          //     //   <img
          //     //     alt='随机图片'
          //     //     src={'https://picsum.photos/id/' + getRandomInt(100) + '/300/400'}
          //     //   />
          //     // }
          //   >
          //     <Meta
          //       title={dayjs(item.createdAt, 'YYYYMMDD').fromNow()}
          //       avatar={<Avatar src='http://127.0.0.1/static/media/avatar.7e58ba1b.jpeg' />}
          //       description={item.content}
          //       // datetime={moment('2020-12-06T04:00:00.000Z').format('MMMM Do YYYY, h:mm:ss a')}
          //     />
          //   </Card>
          // </List.Item>
        )}
      />
    </div>
  )
}

export default FragmentList
