#!/bin/bash
# My script - sysinfo.sh
# This script displays the system information


hostname
hostnamectl
hostname
echo -e "-------------------------------Disk Usage >80%-------------------------------"
df -Ph | sed s/%//g | awk '{ if($5 > 80) print $0;}'
echo ""


