const express = require('express');
const app = express();
const db = require('./db.js');
const CDB = db.CDB;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.post('/:hash/:method/:col/:key', async (req, res) => {
  const {method,hash,col,key} = req.params;
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} ${method} key: ${key} with params ${JSON.stringify(req.params)}`)
  CDB(res,method,col,key,req.body)
  }else{
  res.json({msg:"Invalid request"}).end()
  }
})

// Delete an item
app.delete('/:hash/:col/:key', async (req, res) => {
  const {hash,col,key} = req.params;
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
  CDB(res,"delete",col,key)
  }else{
  res.json({msg:"Invalid request"}).end()
  }
})

// Get a single item
app.get('/:hash/:col/:key', async (req, res) => {
  const {hash,col,key} = req.params;
  if(hash===APP_TOKEN){
  console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
  CDB(res,"get",col,key)
  }else{
  res.json({msg:"Invalid request"}).end()
  }
})

// Get a full listing
app.get('/:hash/:col', async (req, res) => {
  const {hash,col} = req.params;
  if(hash===APP_TOKEN){
  console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
  CDB(res,"list",col)
  }else{
  res.json({msg:"Invalid request"}).end()
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
