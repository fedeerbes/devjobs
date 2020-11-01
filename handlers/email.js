const { host, port, user, pass } = require("../config/email");
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const util = require("util");

const transport = nodemailer.createTransport({
  host,
  port,
  auth: {
    user,
    pass,
  },
});

// use handlebars template
transport.use(
  "compile",
  hbs({
    viewEngine: {
      extName: ".handlebars",
      partialsDir: __dirname + "/../views/partials/emails",
      defaultLayout: false,
    },
    viewPath: __dirname + "/../views/partials/emails",
    extname: ".handlebars",
  })
);

exports.send = async (options) => {
  const emailConfig = {
    from: "devJobs <noreply@devjobs.com>",
    to: options.user.email,
    subject: options.subject,
    template: options.file,
    context: {
      resetUrl: options.resetUrl,
    },
  };
  const sendMail = util.promisify(transport.sendMail, transport);
  return sendMail.call(transport, emailConfig);
};
