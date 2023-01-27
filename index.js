const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')
const APP_TOKEN = process.env.API_AUTH_TOKEN;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/:hash/:col/:key', async (req, res) => {
  console.log(req.body)
  const hash = req.params.hash
  const col = req.params.col
  const key = req.params.key
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).set(key, req.body)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
  }else{
  res.json("Invalid request").end()
  }
})

// Delete an item
app.delete('/:hash/:col/:key', async (req, res) => {
  const hash = req.params.hash
  const col = req.params.col
  const key = req.params.key
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).delete(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
  }else{
  res.json("Invalid request").end()
  }
})

// Get a single item
app.get('/:hash/:col/:key', async (req, res) => {
  const hash = req.params.hash
  const col = req.params.col
  const key = req.params.key
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  const item = await db.collection(col).get(key)
  console.log(JSON.stringify(item, null, 2))
  res.json(item).end()
  }else{
  res.json("Invalid request").end()
  }
})

// Get a full listing
app.get('/:hash/:col', async (req, res) => {
  const hash = req.params.hash
  const col = req.params.col
  if(hash===APP_TOKEN){
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  const items = await db.collection(col).list()
  console.log(JSON.stringify(items, null, 2))
  res.json(items).end()
  }else{
  res.json("Invalid request").end()
  }
})

// Catch all handler for all other request.
app.use('*', (req, res) => {
  res.json({ msg: 'no route handler found' }).end()
})

// Start the server
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`index.js listening on ${port}`)
})
