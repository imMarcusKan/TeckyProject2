var nodeoutlook = require("nodejs-nodemailer-outlook");

export async function sendEmailToUser(user_email: string, link: string) {
  nodeoutlook.sendEmail({
    auth: {
      user: "hardyleung@outlook.com",
      pass: "q(SNeZ*36/HXTRV",
    },
    from: "hardyleung@outlook.com",
    to: user_email, //"leunghardy@gmail.com",
    subject: "Hey you, awesome!",
    html: `<b>This is the link to reset the password ${link}</b>`,
    text: "This is text version!",
    replyTo: "hardyleung@outlook.com",

    onError: (e: any) => console.log(e),
    onSuccess: (i: any) => console.log(i),
  });
}
