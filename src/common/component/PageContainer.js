import React from 'react';
import ComponentExd from '../extentions/ComponentExd';
import PropTypes from 'prop-types';
import Pages from '../../pages/index';
// import Language from './Language';
import { VoidContainer } from '../../state/storeActions';

class PageContainer extends ComponentExd {
    constructor(props, context) {
        super(props);
        this.isExists = false;
        this.path = '';
        this.getPageWithAppContainer = this.getPageWithAppContainer.bind(this);
        this.getchildProps = this.getchildProps.bind(this);
        this.store = context.store;
    }
    getchildProps () {
        const state = this.store.getState();
        const rootProps = state.root || {};
        const { app } = this.props.route;
        const appProps = state[app];
        const result = {
            root: rootProps,
            PageID: this.props.PageID,
            message: this.props.message
        };
        result[app] = appProps;
        return result;
    }
    getCurrentPage () {
        const { route, PageID } = this.props;
        const { app, mod, page } = route;
        try {
            const reg = /([a-zA-Z0-9]*)(Container)$/;
            let curPage = '';
            if (reg.test(PageID)) {
                curPage = (<div>Container Page structure is building...</div>);
            } else {
                curPage = Pages[PageID] || (<span>404 Page Not Found</span>);
            }
            this.isExists = true;
            return this.getPageWithAppContainer(curPage);
        } catch (e) {
            this.isExists = false;
            this.path = `${app}/${mod}/${page}`;
            console.error(e);
            return null;
        }
    }
    componentDidMount () {
        this.getCurrentPage();
    }
    componentDidUpdate () {
        this.Page || this.getCurrentPage();
    }
    getPageWithAppContainer (Page) {
        let ResultContainerPage = '';
        const { route } = this.props;
        const { app } = route;
        const childProps = this.getchildProps();
        const AppContainerKey = [app, 'Container'].join('');
        const AppContainer = VoidContainer && VoidContainer[AppContainerKey] ? VoidContainer[AppContainerKey] : null;
        if (AppContainer) {
            ResultContainerPage = AppContainer(Page, childProps);
        } else {
            ResultContainerPage = Page;
        }
        return ResultContainerPage;
    }
    render () {
        const displayPage = (() => {
            const CurrentPage = this.Page || this.getCurrentPage();
            if (this.isExists && CurrentPage) {
                const PageElement = <CurrentPage {...this.props} />;
                return PageElement;
            } else {
                let ReactPage404 = null;
                if (this.props.route.app === 'AppMobile') {
                    const key = 'AppMobileMod404Page404';
                    const Page404 = Pages[key];
                    ReactPage404 = <Page404 {...this.props} />;
                } else {
                    const key = 'AppIndexMod404Page404';
                    const TmpPage404 = Pages[key];
                    ReactPage404 = <TmpPage404 {...this.props} />;
                }
                if (!ReactPage404) {
                    ReactPage404 = (
                        <div>
                            <h1>Page not found(404)</h1>
                            <span>{this.path}</span>
                        </div>
                    );
                }
                return ReactPage404;
            }
        })();
        const CurrentPage = displayPage;
        return (CurrentPage);
    }
}

PageContainer.propTypes = {
    message: PropTypes.func.isRequired,
    PageID: PropTypes.string.isRequired,
    route: PropTypes.object.isRequired
};
PageContainer.contextTypes = {
    axios: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
};
PageContainer.defaultProps = {
    route: {
        app: 'AppIndex',
        mod: 'ModIndex',
        page: 'PageIndex'
    }
};

export default PageContainer;
