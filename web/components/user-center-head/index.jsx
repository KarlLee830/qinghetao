import React from 'react';
import styles from './index.module.scss';
import H5HeadetContent from './h5/index';
import PCHeadetContent from './pc/index';
class UserCenterHead extends React.Component {

    renderPCContent() {
        return (
            <div className={styles.pcbox}>

            </div>
        )
    }

    render() {
        const { platform, isOtherPerson,handleSetBgLoadingStatus } = this.props;
        if (platform === 'h5') {
            return <H5HeadetContent isOtherPerson={isOtherPerson} />;
        } else {
            return <PCHeadetContent handleSetBgLoadingStatus={handleSetBgLoadingStatus} isOtherPerson={isOtherPerson}/>;
        }
    }

}

export default UserCenterHead;