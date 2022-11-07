Get-Ciminstance -Class win32_networkadapterconfiguration |
where { $_.ipenabled -eq "true"}|
#?{ $_.ipenabled -eq "True"}|
Format-Table -AutoS Description, Index, IPAddress, IPSubnet,
@{n="DNSServersearchorder";
    e={
    Switch($_.DNSServersearchorder)
    {
        $NULL{
        $variable1="Value is empty...";
        $variable1
    }
   };
   if($null -ne $_.DNSServerSearchorder)
     {
        $_.DNSServerSearchorder
     }
    }
  },
@{n="DNSdomain";
    e={
    Switch($_.DNSdomain)
    {
        $NULL
        {
            $variable2="Value is empty...";
            $variable2
        }
    };
    if($null -ne $_.DNSdomain)
    {
        $_.DNSdomain
    }
      }
 }
