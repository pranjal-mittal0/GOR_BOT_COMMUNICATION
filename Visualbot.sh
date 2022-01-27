#!/bin/bash

source $(dirname $0)/simple_curses.sh

#creating two fresh fifo pipe
rm -f inputPipe
mkfifo inputPipe
rm -f outputPipe
mkfifo outputPipe

RED='\033[0;31m'
NC='\033[0m'

#whatever write into inputPipe should go to TCP server(Server ip needs to pass in command line argument)
#and response of Tcp server should capture in outputPipe
nc -v $1 19204 > outputPipe <inputPipe &
pid1=$!

counter=1;
#continously looking for server response and then afer reading the response, again quering 
#same information again after some interval
nc -v $1 19204 > outputPipe <inputPipe &
pid1=$!

counter=1;
#continously looking for server response and then afer reading the response, again quering 
#same information again after some interval
while true; 
  do
#first time send request packet from here
    if [ $counter == 1 ]; then
      echo -ne '\x5A\x01\x00\x01\x00\x00\x00\x00\x04\x4C\x00\x00\x00\x00\x00\x00' > inputPipe 
      ((counter++))
    fi 
#read buffer till the first character of response buffer
    if read -r -d$'\x5A' line; 
    then
#remove header till the first character '{' of body
      tmp=${line#*\{}
      tchar='{'
#append starting character '{' of response
      response="${tchar}${tmp}"
      if [ ${#response} -gt 1 ]; then
        clear
        val=$(jq -c '.vehicle_id' <<< $response); echo -e "Vehicle ID: ${RED}$val${NC}"; 
        
        val=$(jq -c '.x' <<< $response); echo -en "X: ${RED}$val${NC}"; 
        val=$(jq -c '.y' <<< $response); echo -e " Y: ${RED}$val${NC}"; 
        
        val=$(jq -c '.battery_level' <<< $response); echo -en "Battery Level: ${RED}$val${NC}"; 
        val=$(jq -c '.battery_cycle' <<< $response); echo -en " Battery Cycle: ${RED}$val${NC}"; 
        val=$(jq -c '.battery_temp' <<< $response); echo -en " Battery Temp: ${RED}$val${NC}"; 
        val=$(jq -c '.voltage' <<< $response); echo -en " Voltage: ${RED}$val${NC}"; 
        val=$(jq -c '.charging' <<< $response); echo -e " Charging: ${RED}$val${NC}"; 
        
        val=$(jq -c '.angle' <<< $response); echo -en "Angle: ${RED}$val${NC}"; 
        val=$(jq -c '.confidence' <<< $response); echo -e " Confidence: ${RED}$val${NC}"; 
        val=$(jq -c '.blocked' <<< $response); echo -en "Blocked: ${RED}$val${NC}"; 
        val=$(jq -c '.brake' <<< $response); echo -en " Brake: ${RED}$val${NC}"; 
        val=$(jq -c '.emergency' <<< $response); echo -e " Emergency: ${RED}$val${NC}": 
        val=$(jq -c '.errors[]' <<< $response); echo -e "Erros: ${RED}$val${NC}"; 
        val=$(jq -c '.fatals[]' <<< $response); echo -e "Fatals: ${RED}$val${NC}"; 
        val=$(jq -c '.warnings[]' <<< $response); echo -e "Warnings: ${RED}$val${NC}"; 

        
        val=$(jq -c '.controller_humi' <<< $response); echo -en "Controller humi: ${RED}$val${NC}"; 
        val=$(jq -c '.controller_temp' <<< $response); echo -en " Controller Temp: ${RED}$val${NC}"; 
        val=$(jq -c '.controller_voltage' <<< $response); echo -en " Controller Voltage: ${RED}$val${NC}";
        val=$(jq -c '.current' <<< $response); echo -e " Current: ${RED}$val${NC}"; 

        val=$(jq -c '.current_ip' <<< $response); echo -en "Current IP: ${RED}$val${NC}";
        val=$(jq -c '.current_map' <<< $response); echo -en " Current Map: ${RED}$val${NC}"; 
        val=$(jq -c '.current_station' <<< $response); echo -en " Current Station: ${RED}$val${NC}"; 
        val=$(jq -c '.last_station' <<< $response); echo -e " Last Station: ${RED}$val${NC}"; 
        val=$(jq -c '.finished_path[]' <<< $response); echo -e "Finished Path: ${RED}$val${NC}";
        val=$(jq -c '.unfinished_path[]' <<< $response); echo -e "Unfinished Path: ${RED}$val${NC}";
        val=$(jq -c '.path[]' <<< $response); echo -e "Path: ${RED}$val${NC}";

        val=$(jq -c '.jack_enable' <<< $response); echo -en "Jack Enable: ${RED}$val${NC}";
        val=$(jq -c '.jack_isFull' <<< $response); echo -en " Jack isFull: ${RED}$val${NC}";
        val=$(jq -c '.jack_mode' <<< $response); echo -en " Jack Mode: ${RED}$val${NC}";
        val=$(jq -c '.jack_state' <<< $response); echo -e " Jack State: ${RED}$val${NC}";
        
        val=$(jq -c '.target_dist' <<< $response); echo -en "Target Dist: ${RED}$val${NC}";
        val=$(jq -c '.target_id' <<< $response); echo -e " Target ID: ${RED}$val${NC}";
        
        val=$(jq -c '.task_status' <<< $response); echo -en "Task Status: ${RED}$val${NC}";
        val=$(jq -c '.task_type' <<< $response); echo -e " Task Type: ${RED}$val${NC}";
      fi
#refresh interval
      sleep 3;
#send request packet again
      echo -ne '\x5A\x01\x00\x01\x00\x00\x00\x00\x04\x4C\x00\x00\x00\x00\x00\x00' >&3
    fi 
  done <outputPipe 3>inputPipe
sleep 1
trap "rm -f inputPipe outputPipe" EXIT 
trap "kill -9 $pid1 EXIT
