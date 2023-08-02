import { NextFunction, Response } from 'express'
import asyncHandler from '../middleware/asyncHandler'
import { validationResult } from 'express-validator'
import fs from 'fs'
import JSFTP from 'jsftp'
import fileUpload from 'express-fileupload'
import dotenv from 'dotenv'
import { sendError, sendResponse } from '../libraries/rest'
dotenv.config()

const rand = () => {
    var digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

const app_url = process.env.APP_URL || 'http://localhost:3000'
const ftp_host = process.env.FTP_HOST;
const ftp_user = process.env.FTP_USERNAME;
const ftp_pass = process.env.FTP_PASSWORD;
const ftp_port = process.env.FTP_PORT;
const ftp_url = process.env.FTP_URL;
const app_key = process.env.APP_KEY;

export const uploadImages = asyncHandler(async (req: any, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new sendError(errors.array()[0].msg, errors.array(), 'VALIDATION_ERROR'))
    }

    if (req.headers['app-key'] !== app_key) {
        return next(new sendError('App key not valid', [], 'PROCESS_ERROR'))
    }

    const ftp = new JSFTP({
        host: ftp_host,
        port: ftp_port ? parseInt(ftp_port) : 21,
        user: ftp_user,
        pass: ftp_pass,
    })

    const { image } = req.files
    // const image = req.files as fileUpload.UploadedFile

    const extension = image.name.split('.').pop()
    const filename = 'file_' + rand()
    const filename_with_ext = filename + '.' + extension;
    const upload_url = '/public/uploads/'+ rand() + '/';
    const upload_full_path = process.cwd() + upload_url;
    const filesize_in_mb = image.size / (1024 * 1024);

    let cekfolder = fs.existsSync(process.cwd() + upload_url)

    if (!cekfolder) {
        fs.mkdir(process.cwd() + upload_url, { recursive: true }, (err) => {
            if (err) throw err;
        })
    }

    image.mv(upload_full_path + filename_with_ext,
        async function (err: any) {
            if (err) {
                return next(new sendError('Upload image error', [], 'PROCESS_ERROR'));
            }

            const buffer = fs.readFileSync(upload_full_path + filename_with_ext);

            ftp.put(buffer, upload_url + filename_with_ext, async function (err: any) {
                if (err) {
                    return next(new sendError('Upload FTP image error', err, 'PROCESS_ERROR'));
                }

                fs.unlink(upload_full_path + filename_with_ext, (err: any) => {
                    if (err) {
                        return next(new sendError('delete image error', err, 'PROCESS_ERROR'));
                    }
                })

                let urlftp = ftp_url + upload_url + filename_with_ext

                if (req.body.ratio) {
                    urlftp = urlftp + '?ratio=' + req.body.ratio
                }

                return res.json(new sendResponse({
                    url: urlftp,
                    size: filesize_in_mb,
                    buffer: buffer,
                    name: filename_with_ext
                }, 'Success upload image', {}));
            }
            );
        })
})