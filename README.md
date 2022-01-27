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

