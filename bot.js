// Include Nodejs' net module.
const Net = require('net');
// The port on which the server is listening.
const port = 19204;
const controlport = 19205;
const navport = 19206;
const otherport = 19210;
MovementTime = 5000;

/*
In order to set more than one ip's at a single machine run below commands and set these ip's in bots array below.
sudo ip addr add 192.168.1.105/24 dev enp0s31f6
sudo ip addr add 192.168.2.105/24 dev enp0s31f6
sudo ip addr add 192.168.3.105/24 dev enp0s31f6

enp0s31f6-> this value can be different for machine to machine so run ('ip address') command and check network card details
Ref: https://ostechnix.com/how-to-assign-multiple-ip-addresses-to-single-network-card-in-linux/
*/

const bots = ["127.0.0.14"];
var botsInfoObj = [];
var botsControlObj = [];
var botsNavObj = [];
var UnfinishedSteps= [];
var FinishedSteps= [];
var navigationTrigger = [];
function str2Hex(str) {
    var result = '';
    for (var i=0; i<str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
 }
function createMessage(responsetype,message){
    SynchronizeBytes = '5A';
    ReserveBytes = '00'.repeat(6);
    MessageTypeBytes = responsetype;
    DataAreaLength = message.length.toString(16);
    DataAreaLengthBytes = ('00'.repeat(4) + DataAreaLength).slice(DataAreaLength.length);
    SerialNum = (parseInt(Math.random() * 65535)).toString(16);
    SerialNumBytes = ('00'.repeat(2) + SerialNum).slice(SerialNum.length);
    ProtocolBytes = '01';
    Data = str2Hex(message);
    FinalMessage = SynchronizeBytes + ProtocolBytes + 
                   SerialNumBytes + DataAreaLengthBytes + 
                   MessageTypeBytes + ReserveBytes + Data;
    FinalMessage = Buffer.from(FinalMessage.toUpperCase(),'hex');
    return FinalMessage;
}
function hex2Str(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function findPathArray(end){
    // creating a dummy path
    min = 5;
    range = 10
    pathlength = parseInt(Math.random() * range) + min;
    patharray = [];
    for(i=0;i<pathlength;i++){
        point = 'LM'+ (parseInt(Math.random() * 100) + 1).toString();
        patharray[i] = point;
    }
    patharray[i] = end;
    return patharray;
}
function moveToNextPoint(index){
    console.log('Vehicle moved '+ FinishedSteps[index][FinishedSteps[index].length-1] +' to '+ UnfinishedSteps[index][0]);
    // removing first element of unfinished steps
    point_covered = UnfinishedSteps[index].shift();
    // added point_covered to finished steps
    FinishedSteps[index].push(point_covered);
}
function startNavigation(target,operation, index){
    UnfinishedSteps[index] = findPathArray(target);
    console.log("index:", index);
    console.log('Path Calculated for task: '+ UnfinishedSteps[index]);
    
    if(UnfinishedSteps[index].length > 0){
      //terminate already running setInterval
      if(navigationTrigger[index]!=undefined){
        clearInterval(navigationTrigger[index]);
        //clear the finished array as task is completed now
        FinishedSteps[index] = [];
      }
      navigationTrigger[index] = setInterval(()=> {
        //check again size of UnfinishedSteps 
        if(UnfinishedSteps[index].length > 0){
          moveToNextPoint(index);
        }
      }, MovementTime);
    }else{
      if(navigationTrigger[index]!=undefined){
        clearInterval(navigationTrigger[index]);
        console.log('Vehicle reached at:'+target +' and '+ operation + 'done');
        
        //clear the finished array as task is completed now
        FinishedSteps[index] = [];

        console.log('Task Complete!!!!');
      }
    }
}

for(let botsIndex = 0; botsIndex < bots.length; botsIndex++)
{
  // Use net.createServer() in your code. This is just for illustration purpose.
  // Create a new TCP server.
  botsInfoObj[botsIndex] = new Net.Server();
  // The server listens to a socket for a client to make a connection request.
  // Think of a socket as an end point.
  botsInfoObj[botsIndex].listen(port, bots[botsIndex], function() {
      console.log(`Server listening for connection requests on socket localhost:${port}`);
  });

  // Starting Nav Server
  botsNavObj[botsIndex] = new Net.Server();
  // The server listens to a socket for a client to make a connection request.
  // Think of a socket as an end point.
  botsNavObj[botsIndex].listen(navport, bots[botsIndex], function() {
      console.log(`Server listening for connection requests on socket localhost:${navport}`);
  });

  // Starting Control Server
  botsControlObj[botsIndex] = new Net.Server();
  // The server listens to a socket for a client to make a connection request.
  // Think of a socket as an end point.
  botsControlObj[botsIndex].listen(controlport, bots[botsIndex], function() {
      console.log(`Server listening for connection requests on socket localhost:${controlport}`);
  });
  
  // Starting Other Server
  botsControlObj[botsIndex] = new Net.Server();
  // The server listens to a socket for a client to make a connection request.
  // Think of a socket as an end point.
  botsControlObj[botsIndex].listen(otherport, bots[botsIndex], function() {
      console.log(`Server listening for connection requests on socket localhost:${otherport}`);
  });
  //initialize finished and unfinished array
  FinishedSteps[botsIndex] = [];
  UnfinishedSteps[botsIndex] = [];

  //initialize navigation trigger as well
  navigationTrigger[botsIndex] = undefined;

  // When a client requests a connection with the server, the server creates a new
  // socket dedicated to that client.
  botsInfoObj[botsIndex].on('connection', (socket) => {
      console.log('A new connection has been established.');

      // Now that a TCP connection has been established, the server can send data to
      // the client by writing to its socket.
      //socket.write('Hello, client.');
      let message_robot_info = {"id":"GO-10"+(botsIndex+1),"version":"v1.1.0","model":"S1","current_ip":"192.168.43.229","dsp_version":"v1.2.2","map_version":"v1.0.0","model_version":"v1.1.0","netprotocol_version":"v1.2.0","vehicle_id":"GO-10"+(botsIndex+1)};
    // The server can also receive data from the client by reading from its socket.
    socket.on('data', function(chunk) {
      console.log("Received message by server");
      //Parsing response data
      let request = chunk.toString('hex').toUpperCase();
      console.log(`Data received from client: ${request}`);
      // First 32 bytes for header and rest data part
      let headerpart = request.slice(0,32);
      let synchronizebytes = headerpart.slice(0,2);
          
      let requestcode = request.slice(16,20)
      let datapart = request.slice(32);
      let datastring = hex2Str(datapart);
      console.log('RequestCode:' + requestcode +' request received:',datastring);
      switch(requestcode){
        case '03E8':
          try
          {
            let msg = createMessage('2AF8',JSON.stringify(message_robot_info));
            console.log('msg:',msg);
            socket.write(msg);
          }catch(e){
            console.log('Exception Caught:',e);
          }
          break;
        case '044C':
        console.log("bulk_query response for bot:", bots[botsIndex]);
          let bulk_response =
          {
            "19204": 1,
            "19204_ip": ["192.168.10.2"],
            "19205": 0,
            "19206": 1,
            "19207": 0,
            "19210": 0,
            "DI": [{
              "id": 0,
              "source": "normal",
              "status": false,
              "valid": true
            }, {
              "id": 1,
              "source": "normal",
              "status": false,
              "valid": true
            }, {
              "id": 2,
              "source": "normal",
              "status": true,
              "valid": true
            }, {
              "id": 3,
              "source": "normal",
              "status": false,
              "valid": true
            }, {
              "id": 4,
              "source": "normal",
              "status": false,
              "valid": true
            }, {
              "id": 5,
              "source": "normal",
              "status": false,
              "valid": true
            }, {
              "id": 6,
              "source": "normal",
              "status": false,
              "valid": true
            }],
            "DO": [{
              "id": 0,
              "source": "normal",
              "status": false
            }, {
              "id": 1,
              "source": "normal",
              "status": false
            }, {
              "id": 2,
              "source": "normal",
              "status": false
            }, {
              "id": 3,
              "source": "normal",
              "status": false
            }, {
              "id": 4,
              "source": "normal",
              "status": false
            }, {
              "id": 5,
              "source": "normal",
              "status": true
            }, {
              "id": 6,
              "source": "normal",
              "status": true
            }],
            "MAC": "40623107E2D1",
            "WLANMAC": "D0C5D3A6C7FB",
            "angle": 1.6064,
            "area_ids": ["1"],
            "auto_charge": false,
            "battery_cycle": 0,
            "battery_level": 0.99,
            "battery_temp": 17.0,
            "block_x": -21.04,
            "block_y": 6.2206,
            "blocked": false,
            "brake": false,
            "calib_status": {
              "desc": "No calibration task",
              "status": 0
            },
            "calibrate_status": 0,
            "charging": false,
            "confidence": 0.9491,
            "controller_humi": 21.885,
            "controller_temp": 43.306,
            "controller_voltage": 23.667,
            "current": -2.045,
            "current_ip": "192.168.0.2",
            "current_map": "Tower2_GF_07-01-20220(1)",
            "current_map_md5": "e3281fcf7744c610ef66af6602e3863c",
            "current_station": "CP17",
            "dispatch_mode": 0,
            "driver_emc": false,
            "electric": true,
            "emergency": false,
            "errors": [],
            "fatals": [],
            "goods_region": {
              "point": []
            },
            "head": 0.597,
            "hook_angle": 0,
            "hook_clamping_state": false,
            "hook_emc": false,
            "hook_enable": false,
            "hook_error_code": 0,
            "hook_height": 0,
            "hook_isFull": false,
            "hook_mode": false,
            "hook_state": 0,
            "jack_emc": false,
            "jack_enable": true,
            "jack_error_code": 0,
            "jack_height": 0.0,
            "jack_isFull": false,
            "jack_mode": false,
            "jack_speed": 0,
            "jack_state": 3,
            "lasers": [{
              "beams": [{
                "angle": -129.9857,
                "dist": 17.553,
                "rssi": 18.0512,
                "valid": true
              }, {
                "angle": 129.6,
                "dist": 5.661,
                "rssi": 33.0706,
                "valid": true
              }],
              "device_info": {
                "device_name": "laser1",
                "max_angle": 130,
                "max_range": 30,
                "min_angle": -130,
                "pub_step": 0.5,
                "real_step": 0.5,
                "scan_freq": 30
              },
              "header": {
                "data_nsec": "1413632427038",
                "frame_id": "laser1",
                "pub_nsec": "1413632427144"
              },
              "install_info": {
                "upside": true,
                "x": -0.49043599549007605,
                "y": -0.32243125825542107,
                "yaw": -135.2999843359916
              },
              "use_forLoc": true
            }],
            "last_station": "",
            "loadmap_status": 1,
            "manualBlock": true,
            "manual_charge": false,
            "mode": 0,
            "model_md5": "aee039aef715b9e5a03d68dca4d70e8c",
            "notices": [],
            "odo": 176150.681,
            "path": [],
            "peripheral_data": [],
            "pgvs": [],
            "pitch": 0.008726646192371845,
            "point_cloud": null,
            "r_spin": -0.0,
            "r_steer": -0.0,
            "r_vx": -0.0,
            "r_vy": -0.0,
            "r_w": -0.0,
            "radius": 0.0,
            "ref_pos": null,
            "reloc_status": 3,
            "removed_regions": [],
            "ret_code": 0,
            "rfids": [],
            "roboroute_target": "",
            "robot_note": "",
            "robot_region": {
              "point": [{
                "x": -21.40517513143214,
                "y": 7.400129752374454
              }, {
                "x": -21.3626311256311,
                "y": 6.20688794638105
              }, {
                "x": -20.569135318295455,
                "y": 6.235179353923787
              }, {
                "x": -20.611679324096496,
                "y": 7.428421159917191
              }]
            },
            "roll": 0.008726646192371845,
            "roller_emc": false,
            "roller_enable": false,
            "roller_error_code": 0,
            "roller_isFull": false,
            "roller_mode": false,
            "roller_speed": 0,
            "roller_state": 0,
            "rssi": 0,
            "running_status": 0,
            "shape": 1,
            "slam_status": 0,
            "slow_path": {
              "point": []
            },
            "slowed": false,
            "soft_emc": false,
            "spin": -0.0,
            "src_release": false,
            "ssid": "",
            "steer": -0.0,
            "stop_path": {
              "point": []
            },
            "tail": 0.597,
            "target_x": 0.0,
            "target_y": 0.0,
            "task_status": 0,
            "task_type": 0,
            "tasklist_status": {
              "actionGroupId": 0,
              "actionIds": [],
              "loop": false,
              "taskId": 0,
              "taskListName": "",
              "taskListStatus": 0
            },
            "time": 1390600,
            "today_odo": -0.0,
            "total_time": 2405570083,
            "tracking_status": 0,
            "ultrasonic_nodes": [],
            "user_objects": [],
            "vehicle_id": "GO-10",
            "voltage": 49.769,
            "vx": -0.0,
            "vy": -0.0,
            "w": -0.0,
            "warnings": [],
            "width": 0.794,
            "x": -20.9872,
            "y": 6.8177,
            "yaw": 0.0017457008361816406
        };
          let msg = createMessage('2B5C',JSON.stringify(bulk_response));
          //console.log('bulk_query response :',JSON.stringify(bulk_response));
          socket.write(msg);
          break;
        case '0515':
          let site_info =  {
              "stations":[
                  {   
                      "id": "AP6",
                      "type": "ActionPoint",
                      "x": -1.23,
                      "y": 4.56,
                      "r": 3.14,
                      "desc": ""
                  },
                  {   
                      "id": "AP2",
                      "type": "ActionPoint",
                      "x": -1.23,
                      "y": 4.56,
                      "r": 3.14,
                      "desc": ""
                  },
                  {
                      "id": "AP3",
                      "type": "ActionPoint",
                      "x": -1.23,
                      "y": 4.56,
                      "r": 3.14,
                      "desc": ""
                  }
              ]  
          };
          let msgT = createMessage('2C25',JSON.stringify(site_info));
          //console.log('msg:',msgT);
          socket.write(msgT);
          break;
        default:
          console.log('Invalid Request code')
      }
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
  });

  //startNavigation('AP34','JackLoad');


  botsNavObj[botsIndex].on('connection', (navsocket) => {
    console.log('A new connection has been established to nav server');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    //navsocket.write('Hello, client.');
    // The server can also receive data from the client by reading from its socket.
    navsocket.on('data', function(chunk) {
      console.log("Received message by navserver");
      //Parsing response data
      let request = chunk.toString('hex').toUpperCase();
      console.log(`Data received from client: ${request}`);
      // First 32 bytes for header and rest data part
      let headerpart = request.slice(0,32);
      let synchronizebytes = headerpart.slice(0,2);
          
      let requestcode = request.slice(16,20);
      console.log('requestcode:',requestcode);
      let datapart = request.slice(32);
      let datastring = hex2Str(datapart);
      console.log('RequestCode:' + requestcode +', request received:',datastring);
      switch(requestcode){
        case '0BEB':
          datastring = JSON.parse(datastring);
          let targetpoint = datastring['id'];
          let operation = datastring['operation'];
          console.log(`Task Received for Target:${targetpoint} and operation:${operation}`);
          startNavigation(targetpoint,operation, botsIndex);
          let navigation_response = {'ret_code':200,'err_msg':'success'};
          let msg = createMessage('32FB',JSON.stringify(navigation_response));
          navsocket.write(msg);
          break;
        case '0BEF': //translation
          let response_data_translation = {'ret_code':200,'err_msg':'success'};
          let translationResponseMsg = createMessage('32FF',JSON.stringify(response_data_translation));
          navsocket.write(translationResponseMsg);
          break;
        case '0BF0': //rotation
          let response_data_rotation = {'ret_code':200,'err_msg':'success'};
          let rotationResponseMsg = createMessage('3300',JSON.stringify(response_data_rotation));
          navsocket.write(rotationResponseMsg);
          break;
      default:
        console.log('Invalid Request code')
      }
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    navsocket.on('end', function() {
        console.log('Closing connection with the client');
    });
  
    // Don't forget to catch error, for your own sake.
    navsocket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
  });

  botsControlObj[botsIndex].on('connection', (controlsocket) => {
    console.log('A new connection has been established to control server');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.
    //navsocket.write('Hello, client.');
    // The server can also receive data from the client by reading from its socket.
    controlsocket.on('data', function(chunk) {
      console.log("Received message by controlserver");
      //Parsing response data
      let request = chunk.toString('hex').toUpperCase();
      console.log(`Data received from client: ${request}`);
      // First 32 bytes for header and rest data part
      let headerpart = request.slice(0,32);
      let synchronizebytes = headerpart.slice(0,2);
          
      let requestcode = request.slice(16,20);
      console.log('requestcode:',requestcode);
      let datapart = request.slice(32);
      let datastring = hex2Str(datapart);
      console.log('RequestCode:' + requestcode +', request received:',datastring);
      switch(requestcode){
        case '07DA': //openLoopMotion
          let response_data_openLoopMotion = {'ret_code':200,'err_msg':'success'};
          let openLoopMotionResponseMsg = createMessage('2EEA',JSON.stringify(response_data_openLoopMotion));
          controlsocket.write(openLoopMotionResponseMsg);
          console.log("openLoopMotion command received");
          break;
        case '07D0': //stopOpenLoopMotion
          let response_data_stopOpenLoopMotion = {'ret_code':200,'err_msg':'success'};
          let stopOpenLoopMotionResposeMsg = createMessage('2EE0',JSON.stringify(response_data_stopOpenLoopMotion));
          controlsocket.write(stopOpenLoopMotionResposeMsg);
          break;
      default:
        console.log('Invalid Request code')
      }
    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.
    controlsocket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.
    controlsocket.on('error', function(err) {
        console.log(`Error: ${err}`);
    });
  });
}
