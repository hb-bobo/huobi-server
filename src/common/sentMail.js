"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("config"));
const nodemailer_1 = __importDefault(require("nodemailer"));
// let mailOptions = {
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: 'bar@example.com, baz@example.com', // list of receivers
//     subject: 'Hello ✔', // Subject line
//     text: 'Hello world?', // plain text body
//     html: '<b>Hello world?</b>' // html body
// };
/**
 *
 * @param emailConfig
 * @param mailOptions
 */
function sentMail(emailConfig, mailOptions) {
    return new Promise(function (resolve, reject) {
        if (!mailOptions.from || !mailOptions.to) {
            throw Error('mailOptions invalid:' + JSON.stringify(mailOptions));
        }
        nodemailer_1.default.createTestAccount((err, account) => {
            if (err) {
                reject(err);
                process.exit(1);
                throw err;
            }
            // create reusable transporter object using the default SMTP transport
            const transporter = nodemailer_1.default.createTransport(emailConfig || config_1.default.get('email'));
            // setup email data with unicode symbols
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error);
                    throw error;
                }
                // console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                resolve(info);
            });
        });
    });
}
exports.default = sentMail;
