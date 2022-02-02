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
        Vehicle_ID=$(jq -c '.vehicle_id' <<< $response); echo -e "Vehicle ID: ${RED}$Vehicle_ID${NC}"; 
        
        V_X_Position=$(jq -c '.x' <<< $response); echo -en "X: ${RED}$V_X_Position${NC}"; 
        V_Y_Position=$(jq -c '.y' <<< $response); echo -e " Y: ${RED}$V_Y_Position${NC}"; 
        
        Vehicle_Battery_Level=$(jq -c '.battery_level' <<< $response); echo -en "Battery Level: ${RED}$Vehicle_Battery_Level${NC}"; 
        Vehicle_Battery_Cycle=$(jq -c '.battery_cycle' <<< $response); echo -en " Battery Cycle: ${RED}$Vehicle_Battery_Cycle${NC}"; 
        Vehicle_Battery_Temperature=$(jq -c '.battery_temp' <<< $response); echo -en " Battery Temp: ${RED}$Vehicle_Battery_Temperature${NC}"; 
        Vehicle_Voltage=$(jq -c '.voltage' <<< $response); echo -en " Voltage: ${RED}$Vehicle_Voltage${NC}"; 
        Vehicle_Charging=$(jq -c '.charging' <<< $response); echo -e " Charging: ${RED}$Vehicle_Charging${NC}"; 

        Vehicle_Angle=$(jq -c '.angle' <<< $response); echo -en "Angle: ${RED}$Vehicle_Angle${NC}"; 
        Vehicle_Confidence=$(jq -c '.confidence' <<< $response); echo -e " Confidence: ${RED}$Vehicle_Confidence${NC}"; 
        Vehicle_Blocked=$(jq -c '.blocked' <<< $response); echo -en "Blocked: ${RED}$Vehicle_Blocked${NC}"; 
        Vehicle_Brake=$(jq -c '.brake' <<< $response); echo -en " Brake: ${RED}$Vehicle_Brake${NC}"; 
        Vehicle_Emergency=$(jq -c '.emergency' <<< $response); echo -e " Emergency: ${RED}$Vehicle_Emergency${NC}": 
        Vehicle_Errors=$(jq -c '.errors[]' <<< $response); echo -e "Erros: ${RED}$Vehicle_Errors${NC}"; 
        Vehicle_Fatals=$(jq -c '.fatals[]' <<< $response); echo -e "Fatals: ${RED}$Vehicle_Fatals${NC}"; 
        Vehicle_Warnings=$(jq -c '.warnings[]' <<< $response); echo -e "Warnings: ${RED}$Vehicle_Warnings${NC}"; 

        Vehicle_Controller_Humidity=$(jq -c '.controller_humi' <<< $response); echo -en "Controller humi: ${RED}$Vehicle_Controller_Humidity${NC}"; 
        Vehicle_Controller_Temperature=$(jq -c '.controller_temp' <<< $response); echo -en " Controller Temp: ${RED}$Vehicle_Controller_Temperature${NC}"; 
        Vehicle_Controller_Voltage=$(jq -c '.controller_voltage' <<< $response); echo -en " Controller Voltage: ${RED}$Vehicle_Controller_Voltage${NC}";
        Vehicle_Current=$(jq -c '.current' <<< $response); echo -e " Current: ${RED}$Vehicle_Current${NC}"; 

        Vehicle_Current_IP=$(jq -c '.current_ip' <<< $response); echo -en "Current IP: ${RED}$Vehicle_Current_IP${NC}";
        Vehicle_Current_Map=$(jq -c '.current_map' <<< $response); echo -en " Current Map: ${RED}$Vehicle_Current_Map${NC}"; 
        Vehicle_Current_Station=$(jq -c '.current_station' <<< $response); echo -en " Current Station: ${RED}$Vehicle_Current_Station${NC}"; 
        Vehicle_Last_Station=$(jq -c '.last_station' <<< $response); echo -e " Last Station: ${RED}$Vehicle_Last_Station${NC}"; 
        Vehicle_Finished_Path=$(jq -c '.finished_path[]' <<< $response); echo -e "Finished Path: ${RED}$Vehicle_Finished_Path${NC}";
        Vehicle_Unfinished_Path=$(jq -c '.unfinished_path[]' <<< $response); echo -e "Unfinished Path: ${RED}$Vehicle_Unfinished_Path${NC}";
        Vehicle_Path=$(jq -c '.path[]' <<< $response); echo -e "Path: ${RED}$Vehicle_Path${NC}";
        
        Vehicle_Jack_Enable=$(jq -c '.jack_enable' <<< $response); echo -en "Jack Enable: ${RED}$Vehicle_Jack_Enable${NC}";
        Vehicle_Jack_isFull=$(jq -c '.jack_isFull' <<< $response); echo -en " Jack isFull: ${RED}$Vehicle_Jack_isFull${NC}";
        Vehicle_Jack_Mode=$(jq -c '.jack_mode' <<< $response); echo -en " Jack Mode: ${RED}$Vehicle_Jack_Mode${NC}";
        Vehicle_Jack_State=$(jq -c '.jack_state' <<< $response); echo -e " Jack State: ${RED}$Vehicle_Jack_State${NC}";
        
        Vehicle_Target_Distance=$(jq -c '.target_dist' <<< $response); echo -en "Target Dist: ${RED}$Vehicle_Target_Distance${NC}";
        Vehicle_Target_ID=$(jq -c '.target_id' <<< $response); echo -e " Target ID: ${RED}$Vehicle_Target_ID${NC}";
        
        Vehicle_Task_Status=$(jq -c '.task_status' <<< $response); echo -en "Task Status: ${RED}$Vehicle_Task_Status${NC}";
        Vehicle_Task_Type=$(jq -c '.task_type' <<< $response); echo -e " Task Type: ${RED}$Vehicle_Task_Type${NC}";
      fi
#refresh interval
      sleep 3;
      main()
      {
        window "Vehicle ID" "RED" "100%"
        append $Vehicle_ID
        endwin
      }
      update()
      {
        
      }
      main_loop

#send request packet again
      echo -ne '\x5A\x01\x00\x01\x00\x00\x00\x00\x04\x4C\x00\x00\x00\x00\x00\x00' >&3
    fi 
  done <outputPipe 3>inputPipe
sleep 1
trap "rm -f inputPipe outputPipe" EXIT 
trap "kill -9 $pid1 EXIT
