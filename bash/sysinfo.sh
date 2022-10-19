#!/#!/bin/bash
# My script - sysinfo.sh
# This script displays the system information

#hostname of the device.
HOSTNAME=$(hostname)


#Setting the systems Fully Qualified Domain Name(FQDN).
FQDN=$(hostname -f)


#Setting the operating system name and version.
OS_NAME=$(lsb_release -d -s)


#Setting the IP address of machine.
IP_ADDRESS=$(ip a s ens33 | grep -w inet | awk '{print $2}')

#Setting the amount of space available in Root file system
FREE_DISK_SPACE=$(df -h /dev/sda3 | tail -1 | awk '{print $4}')


#Calling Variables to display the Output.
cat <<EOF
Report for $HOSTNAME

====================================================================== 
FQDN: $FQDN
Operating System name and version: $OS_NAME 
IP Address: $IP_ADDRESS
Root Filesystem Free Space: $FREE_DISK_SPACE
====================================================================== 
EOF
