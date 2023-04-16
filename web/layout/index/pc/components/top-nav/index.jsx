import React, { useMemo, useState } from 'react';
import filterData from '../top-menu/data';
import SiteMapLink from '@components/site-map-link';
import styles from './index.module.scss';

const TopNavItem = ({ data }) => {
    const [types, setTypes] = useState([])

    const onClickItem = (item) => {
        if (types.indexOf(item) !== -1) {

        } else {
            const tmp = types.slice()
            tmp.push(item)
            setTypes(tmp)
        }
    }

    const sty = useMemo(() => {
        return types.indexOf(data.type) !== -1 ? styles.wrapperActive : ''
    }, [types])

    return (
        <>
            <SiteMapLink href={`/thread/${data.threadId}`} text={data?.children}/>
            <div className={`${styles.wrapper} ${sty}`} onClick={() => onClickItem(data.type)}>
                <span>{data.label}</span>
                <div className={styles.line}></div>
                {data?.children && <TopNavChildrenItem subData={data?.children} />}
            </div>
        </>
       
    );
}

const TopNavChildrenItem = ({ subData }) => {

    return (
        <div className={styles.childrenWrapper}>
            {
                subData?.map((subItem, index) => <div key={index} className={styles.subItem}>{subItem.label}</div>)
            }
        </div>
    );
}

const TopNav = () => {

    return (
        <div className={styles.container}>
            {
                filterData.map((item, index) => <TopNavItem key={index} data={item} />)
            } 
        </div>
    );
}

export default TopNav;