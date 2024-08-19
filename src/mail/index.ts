class EmailMessage {
  constructor({ subject, body, from, to, cc = [], bcc = [], attachments = [] }) {
    this.subject = subject;
    this.body = body;
    this.from = from;
    this.to = to;
    this.cc = cc;
    this.bcc = bcc;
    this.attachments = attachments;
  }

  toMailOptions() {
    return {
      from: this.from,
      to: this.to.join(","),
      cc: this.cc.join(","),
      bcc: this.bcc.join(","),
      subject: this.subject,
      text: this.body,
      attachments: this.attachments.map((file) => ({
        filename: file.filename,
        path: file.path,
      })),
    };
  }
}


class EmailMultiAlternative extends EmailMessage {
  constructor({ subject, body, from, to, cc = [], bcc = [], attachments = [], html }) {
    super({ subject, body, from, to, cc, bcc, attachments });
    this.html = html;
  }

  override toMailOptions() {
    return {
      from: this.from,
      to: this.to.join(","),
      cc: this.cc.join(","),
      bcc: this.bcc.join(","),
      subject: this.subject,
      text: this.body,
      html: this.html,
      attachments: this.attachments.map((file) => ({
        filename: file.filename,
        path: file.path,
      })),
    };
  }
}
