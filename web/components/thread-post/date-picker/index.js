/**
 * 发帖页标题
 * 新引入组件需要   import DatePicker from 'react-mobile-datepicker';
 * 详细参数参考  https://www.npmjs.com/package/react-mobile-datepicker#dateconfig
 */
import React, { memo, useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-mobile-datepicker';
import PropTypes from 'prop-types';
import styles from './index.module.scss';

const DatePickers = ({ onCancels, time, onSelects, isOpen }) => {
    // dateConfig 可展示的数据年、月、日之类的
    const [dateConfig, setdateConfig] = useState({
        'year': {
            format: 'YYYY',
            caption: 'Year',
            step: 1,
        },
        'month': {
            format: 'MM',
            caption: 'Mon',
            step: 1,
        },
        'date': {
            format: 'DD',
            caption: 'Day',
            step: 1,
        },
        'hour': {
            format: 'hh',
            caption: 'Hour',
            step: 1,
        },
        'minute': {
            format: 'mm',
            caption: 'Min',
            step: 1,
        }
    })
    const handleSelect = useCallback((e) => {
        onSelects(e)
    })
    const handleCancel = useCallback((e) => {
        onCancels(e)
    })
    return (
        <DatePicker
            dateConfig={dateConfig}
            value={time}
            isOpen={isOpen}
            onSelect={(e) => { handleSelect(e) }}
            onCancel={(e) => { handleCancel(e) }}
        />
    );
};
// 设置props默认类型
DatePickers.propTypes = {
    time: PropTypes.string,
    isOpen: PropTypes.bool,
    onCancels: PropTypes.func,
    onSelects: PropTypes.func,
};

// 设置props默认值
DatePickers.defaultProps = {
    onCancels: (e) => { 
        // console.log('点击了取消') 
    },//点击取消的时候回调
    onSelects: (e) => { 
        // console.log(e) 
    },//点击完成的时候，返回现在选中的时间
    isOpen: false,//是否显示
    time: new Date(),//目前选中时间
};

export default memo(DatePickers);
