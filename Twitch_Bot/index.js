const tmi = require('tmi.js');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const { v4: uuidv4 } = require('uuid');
var fs = require('fs')
var args = process.argv;

const streamer = String(args[2]);
console.log("-----------------------------------------------------------------------------------------------------------------")
console.log("\n---- On commence l'analyse du stream de << ",streamer," >> toutes les 10 minutes une sauvegarde sera faite. ----");
console.log("---- Un seul streamer peut être analysé à la fois.                                                            ----\n");
console.log("------------------------------------------------------------------------------------------------------------------")
const timeIntervalToSave =  1000*60*10;


// Define configuration options
const opts = {
  identity: {
    username: String(args[3]),
    password: String(args[4]) 
  },
  channels: [
    streamer
  ]
};

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();
class Messages{
  constructor(user,msg){
    this.user = user;
    this.msg = cleanString(msg);
    var d = new Date();
    this.time = d.toLocaleTimeString();
  }

  getMsg(){
    return String(this.msg).replace(/,/g, "");
  }

  getUser(){
    return String(this.user);
  }

  getTime(){
    return String(this.time);
  }
}

class MessagesList{
  constructor(){
    this.msgList = new Array();
  }

  getMsgList(){
    return this.msgList;
  }

  addMsg(msg){
    this.msgList.push(msg)
  }

}

var MsgList = new MessagesList();

async function writeInFile(index,csvWriter) {
  if(index==MsgList.getMsgList().length){
    console.log('finish');
    setTimeout(writeInFile, timeIntervalToSave,0);
  }
  else{
    if(index==0){
      csvWriter=createFile(streamer+'_'+uuidv4());
    }
    const result = await csvWriter.writeRecords([{user:  MsgList.getMsgList()[index].getUser() ,message: MsgList.getMsgList()[index].getMsg(), time: MsgList.getMsgList()[index].getTime()}]);
    writeInFile(index+1,csvWriter);
  }
}

function createFile(nameFile){
  createDirectory();
  const csvWriter = createCsvWriter({
    path: './Chats/' +streamer+"/"+ nameFile+ '.csv',
    header: [
        {id: 'user', title: 'USER'},
        {id: 'message', title: 'MESSAGE'},
        {id: 'time', title: 'TIME'}
    ]
  });
  return csvWriter;
}

function createDirectory(){
  try { 
    fs.mkdirSync("./Chats/"+streamer+"/"); 
  } 
  catch(e) { 
    if ( e.code != 'EEXIST' ) 
    throw e; 
  } 
}

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot
  //console.log('user:', context.username, 'msg: ', msg);
  MsgList.addMsg(new Messages(context.username,msg));
  const commandName = msg.trim();
  if (commandName === '!save') {
    writeInFile(0)
  } 
}

setTimeout(writeInFile, timeIntervalToSave,0);

function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

function cleanString(input) {
  var output = "";
  for (var i=0; i<input.length; i++) {
      if (input.charCodeAt(i) <= 127) {
          output += input.charAt(i);
      }
  }
  return output;
}