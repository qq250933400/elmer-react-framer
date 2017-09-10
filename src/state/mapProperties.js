import {
    appInit
} from './actions';
import UserHead from 'AliasImages/userhead.jpg';

export const mapStateToProps = (state) => {
    console.log(state, '******************************************');
    return {
        UserHead,
        ...state
    };
};

export const mapDispatchToProps = (dispatch) => {
    return {
        init: (data) => {
            dispatch(appInit(data));
        }
    };
};
