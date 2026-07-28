$code = @"
using System;
using System.Runtime.InteropServices;
using System.Text;

public class ActiveWin {
    [DllImport("user32.dll")]
    public static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);

    [DllImport("user32.dll", SetLastError = true)]
    public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
}
"@

Add-Type -TypeDefinition $code -ErrorAction SilentlyContinue

$hwnd = [ActiveWin]::GetForegroundWindow()
$sb = New-Object System.Text.StringBuilder 256
[ActiveWin]::GetWindowText($hwnd, $sb, 256) | Out-Null
$title = $sb.ToString()

$pidOut = 0
[ActiveWin]::GetWindowThreadProcessId($hwnd, [ref]$pidOut) | Out-Null
$proc = Get-Process -Id $pidOut -ErrorAction SilentlyContinue

$res = @{
    title = $title
    process = if ($proc) { $proc.ProcessName } else { "" }
}

$res | ConvertTo-Json -Compress
