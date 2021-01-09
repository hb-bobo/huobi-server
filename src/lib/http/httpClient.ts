import http from 'http';
import request from 'request';

const DEFAULT_HEADER = {
    'content-type': 'application/json;charset=utf-8',
}

const agentOptions = {
    keepAlive: true,
    maxSockets: 256,
}

export const get = function(url, options) {
    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            method: 'get',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        }
        request.get(httpOptions, function(err, res, body) {
            if (err) {
                reject(err);
            } else {
                if (res.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(res.statusCode);
                }
            }
        }).on('error', (err) => {
            reject(err)
        });
    });
}

export const post = function(url, postdata, options) {

    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            body: JSON.stringify(postdata),
            method: 'post',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        };
        request(httpOptions, function(err, res, body) {
            if (err) {
                reject(err);
            } else {
                if (res.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(res.statusCode);
                }
            }
        }).on('error', (err) => {
            reject(err)
        });
    });
};

export const form_post = function(url, postdata, options) {

    return new Promise((resolve, reject) => {
        options = options || {};
        const httpOptions = {
            url,
            form: postdata,
            method: 'post',
            timeout: options.timeout || 3000,
            headers: options.headers || DEFAULT_HEADER,
            proxy: options.proxy || '',
            agentOptions
        };
        request(httpOptions, function(err, res, body) {
            if (err) {
                reject(err);
            } else {
                if (res.statusCode === 200) {
                    resolve(body);
                } else {
                    reject(res.statusCode);
                }
            }
        }).on('error', (err) => {
            reject(err)
        });
    });
};