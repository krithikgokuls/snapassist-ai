export interface DocChunk {
  id: string;
  title: string;
  category: string;
  content: string;
  keywords: string[];
  source: string;
  commands?: {
    cmd: string;
    description: string;
    risk: 'Low' | 'Medium' | 'High';
    explanation: string;
  }[];
}

export const KNOWLEDGE_BASE: DocChunk[] = [
  {
    id: "net-01",
    title: "Windows Wi-Fi & Internet Diagnostics",
    category: "Network troubleshooting",
    source: "HP Snapdragon Windows Network Guide Section 3.1",
    keywords: ["wifi", "internet", "connected", "no internet", "network adapter", "ping", "gateway"],
    content: "When a Windows laptop is connected to Wi-Fi but displays 'No Internet Access', the failure usually lies in DNS resolution or the IP configuration lease. First, verify local gateway ping. IP configuration issues can be solved by releasing and renewing the DHCP lease. Network adapters utilizing Qualcomm FastConnect 7800 on Snapdragon Elite systems may experience sleep state desynchronization if Windows Power Management overrides are active. To resolve, reset the network socket layer.",
    commands: [
      {
        cmd: "ipconfig /release && ipconfig /renew",
        description: "Re-requests dynamic IP address lease from the DHCP server.",
        risk: "Low",
        explanation: "Temporarily drops network adapter connection and negotiates a fresh local IP address. Safe for user execution."
      },
      {
        cmd: "netsh winsock reset",
        description: "Resets WINSOCK Catalog to default configuration.",
        risk: "Medium",
        explanation: "Reinitializes the Windows socket connection protocol. Requires system restart to take full effect."
      }
    ]
  },
  {
    id: "dns-01",
    title: "DNS Resolution & Flush Procedures",
    category: "DNS troubleshooting",
    source: "HP Windows Client DNS Diagnostics",
    keywords: ["dns", "lookup failed", "flush dns", "host files", "nslookup", "ipconfig /flushdns"],
    content: "DNS resolution failure prevents hostnames from resolving to IP addresses, showing symptoms like 'connected, no internet' in web browsers. If local gateway (e.g. 192.168.1.1) is pingable but external names (e.g. google.com) fail to resolve, the DNS cache is likely corrupted or configured with unresponsive servers. Windows stores DNS lookups locally; a corrupted cache will repeatedly block access. Flush the resolver cache and configure static fallback DNS servers (8.8.8.8, 1.1.1.1) to test.",
    commands: [
      {
        cmd: "ipconfig /flushdns",
        description: "Clears the DNS client resolver cache.",
        risk: "Low",
        explanation: "Flushes local hostname mapping records. Completely safe and resolves 90% of DNS mismatch errors instantly."
      },
      {
        cmd: "nslookup google.com",
        description: "Queries the DNS server to find the IP mapping for a domain.",
        risk: "Low",
        explanation: "Diagnostic tool used to verify if your configured DNS server can resolve external domains."
      }
    ]
  },
  {
    id: "print-01",
    title: "Enterprise Print Spooler Recovery",
    category: "Printer troubleshooting",
    source: "Windows 11 Print Architecture Reference",
    keywords: ["printer", "print spooler", "stuck print", "queue", "driver", "hp smart", "offline"],
    content: "Print spooler failure halts all local print queues, causing printers to show as 'Offline' or jobs to freeze in 'Deleting...' status. On Snapdragon HP PCs, verify the HP Print Queue Manager is running in ARM64 native mode. If jobs are corrupt, stop the print spooler service, manually delete cached spooler files in 'C:\\Windows\\System32\\spool\\PRINTERS', and restart the spooler service. This clears hung printer jobs without losing printer definitions.",
    commands: [
      {
        cmd: "net stop spooler && del /Q /F /S \"%systemroot%\\System32\\Spool\\Printers\\*.*\" && net start spooler",
        description: "Forcefully purges all hung print jobs and restarts print services.",
        risk: "High",
        explanation: "Halts the printer spooler system, deletes corrupt binary spool files, and re-engages the printing pipeline. This will cancel all currently pending print jobs immediately."
      }
    ]
  },
  {
    id: "update-01",
    title: "Windows Update Error & WSUS Clean",
    category: "Windows Update troubleshooting",
    source: "HP IT Admin Handbook v12",
    keywords: ["windows update", "wu", "error 0x8", "wsus", "software distribution", "windows update failure"],
    content: "Windows Update errors (e.g., 0x80240020, 0x80070002) generally point to a corrupted SoftwareDistribution directory where Windows downloads temporary patches. Cleaning the SoftwareDistribution folder forces Windows Update to re-verify metadata against Microsoft or local WSUS servers. Stop Windows Update (wuauserv) and Background Intelligent Transfer Service (BITS) before purging, or Windows will lock the files.",
    commands: [
      {
        cmd: "net stop wuauserv && net stop bits",
        description: "Terminals update download services.",
        risk: "Medium",
        explanation: "Temporarily disables background Windows Update services to allow directory modifications. Safe, but stops updates in progress."
      },
      {
        cmd: "del /f /s /q %windir%\\SoftwareDistribution\\*.*",
        description: "Deletes all downloaded temporary update assets.",
        risk: "High",
        explanation: "Removes temporary update database files. Forces Windows Update to re-download patches from scratch next time it is executed."
      }
    ]
  },
  {
    id: "blue-01",
    title: "Bluetooth Transceiver Reset & Driver Recovery",
    category: "Bluetooth troubleshooting",
    source: "Snapdragon Wireless Coexistence Manual",
    keywords: ["bluetooth", "bt", "device missing", "audio stutter", "headset", "driver reset", "pairing"],
    content: "Bluetooth desynchronization or sudden disappearance of the BT tray icon on HP EliteBook systems is caused by power-state desynchronization of the Qualcomm FastConnect Bluetooth adapter. If Bluetooth fails to switch on, disable and re-enable the device in Device Manager, or perform a full hard reset of the wireless radio coexistence subsystem using Netsh wireless helpers.",
    commands: [
      {
        cmd: "netsh wlan stop hostednetwork",
        description: "Stops virtual wireless sharing interfaces.",
        risk: "Low",
        explanation: "Disables local wireless sharing configurations which might interfere with Bluetooth coexistence bandwidth."
      }
    ]
  },
  {
    id: "vpn-01",
    title: "Corporate VPN & Split-Tunneling Routing",
    category: "VPN troubleshooting",
    source: "Enterprise VPN Integration Standard",
    keywords: ["vpn", "split tunneling", "anyconnect", "forticlient", "route", "metric", "no local network"],
    content: "When corporate VPN is connected, users may lose connection to local network devices (like local printers or NAS). This is caused by lack of 'Split Tunneling' configuration where all traffic, including local subnet ranges, is routed over the VPN virtual interface. Adding manual routing rules or adjusting network adapter interface metrics in Windows can restore parallel access to the local 192.168.1.0/24 subnet.",
    commands: [
      {
        cmd: "route print",
        description: "Prints active IPv4 and IPv6 network routing tables.",
        risk: "Low",
        explanation: "Lists active pathways, gateways, and interface metrics. Diagnostic only, fully safe."
      }
    ]
  },
  {
    id: "office-01",
    title: "Microsoft Office & Outlook Profile Repair",
    category: "Microsoft Office troubleshooting",
    source: "HP Office Productivity Guide",
    keywords: ["outlook", "word", "excel", "pst", "profile", "activation", "safe mode", "crash"],
    content: "Outlook profile corruption causes immediate crashes on startup or hanging at 'Loading Profile'. To bypass corrupt settings without reinstalling, trigger Outlook Safe Mode which disables third-party add-ins. If activation errors persist after system migration on Snapdragon ARM64 architectures, clear the Microsoft Office activation licenses cached in credentials manager or perform an online licensing alignment.",
    commands: [
      {
        cmd: "outlook.exe /safe",
        description: "Launches Microsoft Outlook in Safe Mode with add-ins disabled.",
        risk: "Low",
        explanation: "Bypasses external add-ins to allow diagnostic profile entry. Safe diagnostic procedure."
      }
    ]
  },
  {
    id: "ad-01",
    title: "Active Directory Domain Join & GPO Refresh",
    category: "Basic Active Directory concepts",
    source: "HP Corporate SysAdmin Manual",
    keywords: ["active directory", "ad", "domain", "gpo", "gpupdate", "trust relationship", "group policy"],
    content: "Active Directory communication issues trigger 'Trust relationship between workstation and primary domain failed'. This occurs when local machine password desynchronizes with the Domain Controller. First-level troubleshooting involves refreshing the Group Policy objects (GPO) using gpupdate to pull network security and drive-mapping updates, and verifying Domain Controller network reachability.",
    commands: [
      {
        cmd: "gpupdate /force",
        description: "Enforces immediate update of all local and network Active Directory group policies.",
        risk: "Low",
        explanation: "Pulls updated network settings, security policies, and drive mapping rules from Domain Controller."
      }
    ]
  },
  {
    id: "sys-01",
    title: "SFC & DISM Local Image Health Repair",
    category: "Common system administrator procedures",
    source: "HP IT Core Diagnostic Handbook",
    keywords: ["sfc", "dism", "blue screen", "corrupt files", "repair", "health", "system file checker"],
    content: "Corrupt system files trigger random blue screens (BSOD) or app crashes. The System File Checker (SFC) tool scans and recovers damaged Windows system files from the local component store cache. If the local cache is also corrupt, Deployment Image Servicing and Management (DISM) can repair the system image by pulling clean files directly from Windows Update or offline installation media.",
    commands: [
      {
        cmd: "sfc /scannow",
        description: "Scans all protected system files and replaces corrupted files with a cached copy.",
        risk: "Medium",
        explanation: "Analyzes Windows system integrity. Replaces corrupt DLLs. Takes 10-20 minutes, might consume CPU resources."
      },
      {
        cmd: "dism /online /cleanup-image /restorehealth",
        description: "Checks and repairs the Windows image component store integrity.",
        risk: "High",
        explanation: "Connects to Windows Update to download and repair corrupted operating system components. Heavy network and CPU usage."
      }
    ]
  }
];
