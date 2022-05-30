const { Router } = require('express')
const router = Router()

const gmail = require("./services/GmailApi")

router.use('/generate-voucher', async (req, res) => {
  
  // const data = await gmail.readInboxContent(process.env.READ_INBOX_GMAIL)
  const data = await gmail.getAllData(req, process.env.READ_INBOX_GMAIL)
  // const data2 = await gmail.getAllData(process.env.READ_INBOX_GMAIL)
  res.json({ data })
  res.end()
})

// router.use('/generate-voucher', async (req, res) => {
//   // const data = await gmail.readInboxContent(process.env.READ_INBOX_GMAIL)
//   // res.json({ data })
// })


module.exports = router