import express from 'express'
import bodyParser from "body-parser"
import chatBot from './chatBot'

const app = express()
const PORT = process.env.PORT || 3333 

app.use(bodyParser.json())

app.get("/chatbot", async (req, res) => {
    const { name, message } = req.query
    const bot = await chatBot(name + "", message + "")
    res.send(bot).status(200).end()
})

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
