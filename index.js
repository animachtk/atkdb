const express = require('express')
const app = express()
const db = require('@cyclic.sh/dynamodb')
const APP_TOKEN = process.env.API_AUTH_TOKEN;

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

async updateMany(table,key,data){
item = await table.get(key);
if(!item){
	item = await table.set(key, {data:[]})
}
item=item.props.data;
if(Array.isArray(data) && data.length>0){
	for(let a of data){
		item.push(a);
	}
}
let deleteCount=0;
if(item.length>3e3){
	let count = 1;
	let re = /(\-([0-9]))$/;
	let newcount=key.match(re);
	
	if(newcount){
	count=Number(newcount[2])+1;
	key=newcount.input.replace(re,'');
	}
	
	key=key+"-"+count;
	updateMany(table,key,data);
	return
/*deleteCount=item.length-3e3;
item.splice(0,deleteCount);*/
}
		
item = await table.set(key, {data:item})
res.json({msg: "Успешно загружено "+data.length+" новых объекта(ов). Всего - "+item.props.data.length+" объекта(ов). Удалено из начала: "+deleteCount+" объекта(ов)."}).end()	
}

async function CDB(res,m,col,key,data){
	let table = db.collection(col);
	let item = false;
	switch(m){
	case "update":
		item = await table.get(key);
		
		if(!item){
		  item = await table.set(key, {data:[]})
		}
		
		item=item.props.data;
		item.push(data);
		item = await table.set(key, {data:item})
	res.json(item).end()	
	break;
	
	case "updateMany":
	updateMany(table,key,data)	
	break;
	
	case "delete":
	item = await table.delete(key);
	res.json(item).end()
	break;
	
	case "list":
	
	item = await table.list();
	res.json(item).end()
	break;
	
	default:
	item = await table.get(key);
  res.json(item).end()
	break;
	}
}

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
