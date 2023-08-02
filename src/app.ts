import express from 'express'
import dotenv from 'dotenv'
import fileUpload from 'express-fileupload'
import cors from 'cors'
import { uploadImages } from './controllers/upload'
import errorHandler from './middleware/errorHandler'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(cors())


app.get('/', (req, res) => {
    res.send('Hello World')
})

app.post('/store', uploadImages)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})