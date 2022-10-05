#!/bin/bash
# My script - sysinfo.sh
# This script displays the system information


hostname -f
hostnamectl
hostname -I
echo -e "-------------------------------Disk Usage >80%-------------------------------"
df -Ph | sed s/%//g | awk '{ if($5 > 80) print $0;}'
echo ""


