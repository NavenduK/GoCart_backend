"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const html_to_text_1 = require("html-to-text");
class Email {
    constructor(user, url) {
        this.to = user.email;
        this.firstName = user.name.split(' ')[0];
        this.url = url;
        this.from = `<${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === 'production') {
            return nodemailer_1.default.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
        }
        return nodemailer_1.default.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT),
            auth: {
                user: process.env.MAILTRAP_USERNAME,
                pass: process.env.MAILTRAP_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });
    }
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Render the HTML based on the html template
            const htmlContent = fs_1.default
                .readFileSync(`${__dirname}/email/${template}.html`, 'utf8')
                .replace('{{url}}', this.url)
                .replace('{{userName}}', this.firstName);
            // 2) Define email options
            const mailOptions = {
                from: this.from,
                to: this.to,
                subject,
                html: htmlContent,
                text: (0, html_to_text_1.htmlToText)(htmlContent),
            };
            // 3) Create a transport
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    // Password reset template
    sendPasswordReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send('password-reset', 'Password Reset Notification');
        });
    }
}
exports.default = Email;
