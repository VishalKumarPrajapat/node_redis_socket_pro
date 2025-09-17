import moment from 'moment';

export const formatResponse = (status: any, success: boolean, message: string, data: any = null) => {
    return { status, success, message, data };
};

export const CURRENT_TIME = moment().format('YYYY-MM-DD HH:mm:ss');