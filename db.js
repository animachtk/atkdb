const db = require('@cyclic.sh/dynamodb')
const APP_TOKEN = process.env.API_AUTH_TOKEN;

async function updateMany(table,key,data){
try{
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
	return await updateMany(table,key,data);
/*deleteCount=item.length-3e3;
item.splice(0,deleteCount);*/
}
		
item = await table.set(key, {data:item});
return {msg: "Успешно загружено "+data.length+" новых объекта(ов). Всего - "+item.props.data.length+" объекта(ов). Удалено из начала: "+deleteCount+" объекта(ов)."};
}catch(e){
console.log(e)
return {msg: "Ошибка при сохранении."};
}
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
		let item = await updateMany(table,key,data);
		res.json(item).end()
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

module.exports = {
CDB:CDB
};
