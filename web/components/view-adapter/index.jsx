import React from 'react';
import { inject, observer } from 'mobx-react';
import CustomHead from '@components/custom-head';

@inject('site')
@inject('search')
@observer
class ViewAdapter extends React.Component {

    renderView() {
        const { pc, h5, title='', keywords='', description = '', showSiteName = true } = this.props;
        const { site } = this.props;
        const { platform } = site;
        const curr = platform === 'pc' ? (pc || null) : (h5 || null);
        return (
            <>
                <CustomHead title={title} keywords={keywords} description={description} showSiteName={showSiteName}/>
                {curr}
            </>
        );
    }

    render() {
        return this.renderView();
    }
}

export default ViewAdapter;