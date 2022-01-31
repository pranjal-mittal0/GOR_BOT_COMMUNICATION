# GOR_BOT_COMMUNICATION

1st run this command
$sudo ip addr add 192.168.3.105/24 dev wlp4s0
then 
$node bot.js

this will simulate the bot.
Now, in another terminal run
$./bot_info.sh <ip of the bot> 
#the ip is same as in bot.js i.e 192.168.3.105
therefore command will be
$./bot_info.sh 192.168.3.105

Remember, to update the ip in bot.js in variable const bots=["192.168.3
.105"]

----------------------------------------------------------
This is the list of commands you can use:

window:- "TITLE" "COLOR" WIDTH = create a window with title, color and width
append:- "TEXT" = append text to the window, be carefull "\n" are not interpreted, you have to append line by line
append_tabbed:- "TEXT" COLS SEP = As "append" function but TEXT will be displayed as table. You need to give number of cols you will display. SEP is ":" by default
append_file:- display a file text on window, text is wrapped to fit window
append_command:- Execute command and display result on window
addsep:- Append a separator
main_loop SEC = run loop every SEC second, default is 1 second


#   blinkenlights <text> <color> <color2> <incolor> <bgcolor> <light1> [light2...]

#   vumeter <text> <width> <value> <max> [color] [color2] [inactivecolor] [bgcolor]

#   progressbar <length> <progress> <max> [color] [bgcolor]
