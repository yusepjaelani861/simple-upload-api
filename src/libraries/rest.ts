export class sendResponse {
    success: boolean;
    message: string;
    data: string | Array<[]>;
    pagination: any;
    error: {
        error_code: string,
        error_data: string,
    };
    constructor(data: any, message = 'Success getting data', pagination = {}) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
        this.error = {
            error_code: '',
            error_data: '',
        }
    }
}

export class sendError {
    success: boolean;
    data: string | null;
    error: {
        error_code: string | 'PROCESS_ERROR',
        error_data: any,
    }
    message: string;
    pagination;
    constructor(message: string, error_data: any, error_code = 'PROCESS_ERROR') {
        this.success = false;
        this.message = message;
        this.data = null;
        this.error = {
            error_code: error_code,
            error_data: error_data,
        }
        this.pagination = {};
    }
}