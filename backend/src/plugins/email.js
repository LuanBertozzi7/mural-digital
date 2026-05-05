import fp from 'fastify-plugin'
import nodemailer from 'nodemailer'

export default fp(async function emailPlugin(fastify) {
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  fastify.decorate('sendMail', ({ to, subject, html }) =>
    transporter.sendMail({
      from: `"Mural Digital" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
  )
})
