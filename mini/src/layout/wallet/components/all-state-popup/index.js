import React, { Component } from 'react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Flex from '@discuzqsdk/design/dist/components/flex/index';
import { View, Text } from '@tarojs/components';

import styles from './index.module.scss';

const { Col, Row } = Flex;

export class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      choice: '',
    };
  }

  onClickFirst = (item) => {
    this.setState({ choice: item.id });
  };

  handleSubmit = (id) => {
    this.props.handleSubmit(id);
    this.props.handleCancel();
  };

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({
        choice: this.props.value,
      });
    }
  }

  render() {
    const { visible, handleCancel, data } = this.props;
    const { choice } = this.state;
    return (
      <Popup position="bottom" visible={visible} onClose={handleCancel}>
        <View className={styles.container}>
          <View className={styles.content}>
            <View className={styles.list}>
              <View className={styles.moduleWrapper}>
                <View className={styles.title}>{this.props.title}</View>
                <Row className={styles.wrapper} gutter={10}>
                  {data.map((item, index) => (
                    <Col span={3}>
                      <Text
                        className={`${choice == item.id ? styles.active : ''} ${styles.span}`}
                        key={index}
                        onClick={() => this.onClickFirst(item)}
                      >
                        {item.title}
                      </Text>
                    </Col>
                  ))}
                </Row>
              </View>
            </View>
          </View>
          <View className={styles.footer}>
            <View className={`${styles.cancel} ${styles.button}`} onClick={handleCancel}>
              取消
            </View>
            <Button
              className={styles.button}
              onClick={() => {
                this.handleSubmit(choice);
              }}
              type="primary"
            >
              确定
            </Button>
          </View>
        </View>
      </Popup>
    );
  }
}

export default index;
