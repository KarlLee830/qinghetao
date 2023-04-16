import React, { useEffect, useMemo, useState } from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Flex from '@discuzqsdk/design/dist/components/flex/index';
import { noop } from '@components/thread/utils';
import filterData from './data';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import { ScrollView } from '@tarojs/components';
import { substr } from '@common/utils/substr';

const { Col, Row } = Flex;

const Index = ({ permissions = {}, visible, data: tmpData = [], typelist, current, onSubmit = noop, onCancel = noop, router, site }) => {
  // const { webConfig: { other: { threadOptimize } } } = site;
  const [first, setFirst] = useState('all');
  const [firstChildren, setFirstChildren] = useState();
  const [second, setSecond] = useState('');
  const [third, setThird] = useState('0');

  const [data, setData] = useState(tmpData);
  // 二级分类原始数据，用于展示
  const [subData, setSubData] = useState([])

  useEffect(() => {
    const newData = filterData;
    newData[0].data = tmpData;
    newData[1].data = [
      {
        name: '全部',
        pid: 'all',
      },
      ...typelist?.slice(),
    ];
    setData(newData);
  }, [typelist?.length, tmpData?.length]);

  useEffect(() => {
    const { categoryids = [], types = 'all', essence, attention } = current || {};

    handleCategoryIds(categoryids);
    setSecond(types || 'all');
    if (Number(essence) === 1) setThird('1');
    if (Number(attention) === 1) setThird('attention');

  }, [current, visible]);

  const handleCategoryIds = (arr) => {
    if (arr?.length) {
      const pid = arr[0]
      const isBool = arr.length === 1 && (arr[0] === 'all' || arr[0] === 'default')

      // 若是大于1，或者等于1且为'all'/'default'，则说明点击的是一级分类
      if (arr.length > 1 || isBool) {
        setFirst(pid)
        setTwo(pid, tmpData)
      } else { // 若是等于1，则说明点击的是没有二级分类的一级分类或者是二级分类
        const tmp = tmpData?.filter(item => item.pid === pid) || []
        if (!tmp.length) { // 不存在，则说明点击的二级分类
          setFirstChildren(pid);
          tmpData?.filter(item => item.children?.length).forEach(item => { // 根据二级分类id，去找对应的一级分类
            item.children.forEach(children => {
              if (children.pid === pid) {
                setFirst(item.pid)
                setTwo(item.pid, tmpData)
              }
            })
          })
        } else { // 存在，说明点击的是没有二级分类的一级分类
          setFirst(pid)
          setTwo(pid, tmpData)
        }
      }
    } else {
      setFirst('all')
    }
  }

  // 点击一级菜单
  const onClickFirst = (index, type, contents) => {
    if (type === 1) {
      setFirst(index);
      setFirstChildren('');

      setTwo(index, contents)
    } else if (type === 2) {
      setSecond(index);
    } else {
      setThird(index);
    }
  };

  // 点击二级菜单
  const onClickSecond = (index, type) => {
    if (type === 1) {
      setFirstChildren(index);
    }
  };

  // 设置二级分类数据
  const setTwo = (id, contents) => {
    const newSubArr = contents?.filter(item => item.pid === id)
    if (!newSubArr.length) {
      setSubData([])
    } else {
      setSubData(newSubArr[0].children || [])
    }
  }

  const goSearch = () => {
    Router.push({ url: '/subPages/search/index' });
  }

  // 结果数据处理
  const handleSubmit = () => {
    let sequence = 0;
    if (first === 'default') {
      sequence = 1;
    }

    let categoryids = [first];
    if (firstChildren) {
      categoryids = [firstChildren];
    } else {
      const tmp = data[0]?.data?.filter(item => item.pid === first)
      if (tmp.length && tmp[0]?.children?.length) {
        categoryids = [first]
        tmp[0]?.children?.forEach(item => {
          categoryids.push(item.pid)
        })
      }
    }

    let attention = '0'; // 是否已关注
    let essence = '0'; // 是否是精华帖
    if (third === 'attention') attention = '1';
    else essence = third;

    const params = { categoryids, types: second, essence, sequence, attention };

    onSubmit(params);
  };

  const handleCancel = () => {
    onCancel();
  };

  // 创建选项
  const renderContent = (dataSource, key) => {
    const { type, data: contents, title } = dataSource;
    let tip = first;
    if (key === 1) {
      tip = second;
    } else if (key === 2) {
      tip = third;
    }

    if (!contents) {
      return null;
    }

    return (
      <View className={styles.moduleWrapper} key={key}>
        <View className={styles.title}>
          <Text>{title}</Text>
          {key === 0 && <Icon className={styles.searchIcon} name='SearchOutlined' size={20} onClick={goSearch}></Icon>}
        </View>
        <Row className={styles.wrapper} gutter={10}>
          {
            contents.map((item, index) => (
              <Col span={ item.name.length < 6 ? 3 : item.name.length === 6 ? 4 : 5 } key={index}>
              <Text
                className={`${tip === item.pid ? styles.active : ''} ${styles.span}`}
                key={index}
                onClick={() => onClickFirst(item.pid, type, contents)}
              >
                {item.name.length > 6 ? substr(item.name, 12) : item.name}
              </Text>
              </Col>
            ))
          }
        </Row>
        {
          type === 1 && subData.length ? (
            <Row className={`${styles.wrapper} ${styles.childrenWrapper}`} gutter={10}>
              {
                subData.map((item, index) => (
                  <Col span={ item.name.length < 6 ? 3 : item.name.length === 6 ? 4 : 5 }>
                    <Text
                      className={`${firstChildren === item.pid ? styles.childrenActive : ''} ${styles.childrenSpan}`}
                      key={`${index}-${index}`}
                      onClick={() => onClickSecond(item.pid, type)}>
                        {item.name.length > 6 ? substr(item.name, 12) : item.name}
                    </Text>
                  </Col>
                ))
              }
            </Row>
          ) : null
        }
      </View>
    );
  };


  return (
    <Popup
      position="bottom"
      visible={visible}
      onClose={handleCancel}
      customScroll
    >
        <View className={styles.container}>
          <ScrollView className={styles.content} scrollY>
            <View className={styles.list} >
             { data && data.map((item, index) => renderContent(item, index)) }
            </View>
          </ScrollView>
          <View className={styles.footer}>
            <Button className={styles.button} onClick={handleSubmit} type="primary">筛选</Button>
            <View className={styles.footerBtn} onClick={handleCancel}>
              <Text className={styles.footerBtnText}>取消</Text>
            </View>
          </View>
        </View>
    </Popup>
  );
};

export default inject('site', )(observer(Index));
