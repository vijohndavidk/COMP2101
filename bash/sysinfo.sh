#!/bin/bash
# My script - sysinfo.sh
# This script displays the system information


echo FQDN: 
hostname -f
echo Host Information:
hostnamectl
echo IP Address :
hostname -I
echo Root file system status :
df -hT /home

