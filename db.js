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
/*let deleteCount=0;
if(item.length>3e3){
	let count = 1;
	/*let re = /(\-([0-9]))$/;
	let newcount=key.match(re);
	
	if(newcount){
	count=Number(newcount[2])+1;
	key=newcount.input.replace(re,'');
	}
	
	key=key+"-"+count;*
	
	let strarr=key.split('-p-');
	if(strarr.length===1){
		key=key+"-p-"+count;
		return await updateMany(table,key,data);
	}else if(strarr.length===2){
		key=strarr[0]+"-p-"+(Number(strarr[0])+1);
		return await updateMany(table,key,data);
	}
//deleteCount=item.length-3e3;
//item.splice(0,deleteCount);
}*/
	
let deleteCount=0;
if(item.length>3e3){
deleteCount=item.length-3e3;
item.splice(0,deleteCount);
}
		
item = await table.set(key, {data:item});
return {msg: "Успешно загружено "+data.length+" новых объекта(ов). Всего - "+item.props.data.length+" объекта(ов). Удалено из начала: "+deleteCount+" объекта(ов)."};
}catch(e){
console.log(e)
return {msg: "Ошибка при сохранении."};
}
}	

async function updateKeys(table,ch,data){
try{

let keys = Object.keys(data);

for(let key of keys){

item = await table.get(key);

if(!item){
	item = await table.set(key, {data:[]})
}

item=item.props.data;

if(Array.isArray(data[key]) && data[key].length>0){
	for(let a of data[key]){
		item.push(a);
	}
}

let deleteCount=0;
if(item.length>3e3){
deleteCount=item.length-3e3;
item.splice(0,deleteCount);
}	
item = await table.set(key, {data:item});

console.log("Успешно загружено в "+key+" "+data[key].length+" новых объекта(ов). Всего - "+item.props.data.length+" объекта(ов). Удалено из начала: "+deleteCount+" объекта(ов).");
	
}
return {msg: "Успешно обновлено "+keys.length+" новых объекта(ов)."};
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
		item = await updateMany(table,key,data);
		res.json(item).end()
	break;
			
	case "updateKeys":
		item = await updateKeys(table,key,data);
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
			
	case "random":
	if(key){
		item = await table.get(key);
		item=item?.props?.data||[];
		if(item.length>0){
			let msg=item[Math.floor(Math.random() * item.length)];
			item=msg
		}else{
			item={msg:"Сообщений с комнатой "+key+" не найдено."}
		}
		res.json(item).end()
	}
	break;

	case "find":
	if(typeof data === "object"){
		item = await table.list();
		results=item.results;
		let keys = results.filter(k=>k.key===key)||[];
			if(keys.length===1){
				let items=[];
				let keyItem=[];
				item = await table.get(key);
				let temparr=item?.props?.data||[];
				keyItem=temparr;
				let exec;
				if(data.exec){
					exec=eval('('+data.exec+')')
				}else{
					exec=function(a,b){
						if(a===b){
							return true
						}else{
							return false
						}
					}
				}
				items=temparr.filter(i=>exec(i,data.value))||[];

				if(items.length>0){
				let msg={};
				if(data.method==="random"){
					msg={data:items[Math.floor(Math.random() * items.length)],method:data.method};
				}else if(data.method==="delete"){
					item = await table.set(key, {data:items});
					let delcount=temparr.length-items.length;
					msg={msg:"Удалено: "+delcount+" записей из "+col+"/"+key+" Осталось: "+items.length,method:data.method}
				}else{
					msg={data:items,method:data.method}
				}
				
				item=msg
				}else{
				item={msg:"Совпадений со значением "+(data.value||"empty")+" не найдено."}
				}
			}else{
				item={msg:"Совпадений с ключом "+key+" не найдено."}
			}

		res.json(item).end()
	}
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
