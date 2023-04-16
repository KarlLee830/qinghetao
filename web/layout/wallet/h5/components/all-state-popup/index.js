import React, { Component } from 'react';
import { Button, Icon, Popup, Flex } from '@discuzqsdk/design';

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
  }

  handleSubmit = (id) => {
    this.props.handleSubmit(id);
    this.props.handleCancel();
  }

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
      <Popup
        position="bottom"
        visible={visible}
        onClose={handleCancel}
      >
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.list} >
              <div className={styles.moduleWrapper}>
                <div className={styles.title}>{this.props.title}</div>
                <Row className={styles.wrapper} gutter={10}>
                  {
                    data.map((item, index) => (
                      <Col span={3}>
                        <span
                          className={`${choice == item.id ? styles.active : ''} ${styles.span}`}
                          key={index}
                          onClick={() => this.onClickFirst(item)}
                        >
                          {item.title}
                        </span>
                      </Col>
                    ))
                  }
                </Row>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <div className={`${styles.cancel} ${styles.button}`} onClick={handleCancel}> 取消 </div>
            <Button className={styles.button} onClick={() => {
              this.handleSubmit(choice);
            }} type="primary">确定</Button>
          </div>
        </div>
      </Popup>
    );
  }
}

export default index;
