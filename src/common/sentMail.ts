import config from 'config';
import nodemailer, { TestAccount } from 'nodemailer';

export interface MailOption{
    from: string; // sender address
    to: string; // list of receivers
    subject: string; // Subject line
    text: string; // plain text body
    html: string; // html body
}
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
function sentMail(emailConfig: any, mailOptions: MailOption) {
    return new Promise(function (resolve, reject) {
        if (!mailOptions.from || !mailOptions.to) {
            throw Error('mailOptions invalid:' + JSON.stringify(mailOptions));
        }
        nodemailer.createTestAccount((err: Error | null, account: TestAccount) => {
            if (err) {
                reject(err);
                process.exit(1)
                throw err;
            }
            // create reusable transporter object using the default SMTP transport
            const transporter = nodemailer.createTransport(emailConfig || config.get('email'));

            // setup email data with unicode symbols
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error: Error | null, info: any) => {
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
export default sentMail;
