$code = @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class WinTracker {
    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

function Get-WindowInfo([IntPtr]$hwnd) {
    if ($hwnd -eq [IntPtr]::Zero) { return $null }

    $sb = New-Object System.Text.StringBuilder 256
    [WinTracker]::GetWindowText($hwnd, $sb, 256) | Out-Null
    $title = $sb.ToString()

    $pidOut = 0
    [WinTracker]::GetWindowThreadProcessId($hwnd, [ref]$pidOut) | Out-Null
    if ($pidOut -eq 0) { return $null }

    $proc = Get-Process -Id $pidOut -ErrorAction SilentlyContinue
    if (-not $proc) { return $null }

    $pName = $proc.ProcessName
    if ($pName -eq "electron" -or $pName -eq "stickydesk-desktop" -or $pName -eq "powershell" -or $pName -eq "cmd" -or $pName -eq "conhost") {
        return $null
    }

    return @{
        process = $pName
        title = $title
    }
}

$lastProc = ""
$lastTitle = ""

# Ultra-fast polling loop (100ms sleep) for instantaneous app switching
while ($true) {
    $hwnd = [WinTracker]::GetForegroundWindow()
    $info = Get-WindowInfo $hwnd
    if ($info) {
        if ($info.process -ne $lastProc -or $info.title -ne $lastTitle) {
            $lastProc = $info.process
            $lastTitle = $info.title
            $info | ConvertTo-Json -Compress
        }
    }
    Start-Sleep -Milliseconds 100
}
