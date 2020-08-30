<#PSScriptInfo
 
.VERSION 1.0.0.0
 
.GUID 084a184a-faa1-47e4-9f1a-5d9ecede68c3
 
.AUTHOR Jeffrey Snover
 
.COMPANYNAME
 
.COPYRIGHT
 
.TAGS
 
.LICENSEURI
 
.PROJECTURI
 
.ICONURI
 
.EXTERNALMODULEDEPENDENCIES
 
.REQUIREDSCRIPTS
 
.EXTERNALSCRIPTDEPENDENCIES
 
.RELEASENOTES
 
 
#>

<#
 
.DESCRIPTION
 Set the desktop background to an RGB color.
  
 The core of this code was produced by http://stackoverflow.com/users/3281719/wheatfairies who
 published it http://stackoverflow.com/questions/25774494/powershell-make-desktop-background-changes-take-effect-immediately
 
#> 
param(
[Parameter(Position=0)]
$R=0,
[Parameter(Position=1)]
$G=0,
[Parameter(Position=2)]
$B=0
)

$code = @'
using System;
using System.Drawing;
using System.Runtime.InteropServices;
using Microsoft.Win32;
 
 
namespace CurrentUser
{
    public class Desktop
    {
        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        private static extern int SystemParametersInfo(int uAction, int uParm, string lpvParam, int fuWinIni);
        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern int SetSysColors(int cElements, int[] lpaElements, int[] lpRgbValues);
        public const int UpdateIniFile = 0x01;
        public const int SendWinIniChange = 0x02;
        public const int SetDesktopBackground = 0x0014;
        public const int COLOR_DESKTOP = 1;
        public int[] first = {COLOR_DESKTOP};
 
 
        public static void RemoveWallPaper()
        {
            SystemParametersInfo( SetDesktopBackground, 0, "", SendWinIniChange | UpdateIniFile );
            RegistryKey regkey = Registry.CurrentUser.OpenSubKey("Control Panel\\Desktop", true);
            regkey.SetValue(@"WallPaper", 0);
            regkey.Close();
        }
 
        public static void SetBackground(byte r, byte g, byte b)
        {
            int[] elements = {COLOR_DESKTOP};
 
            RemoveWallPaper();
            System.Drawing.Color color = System.Drawing.Color.FromArgb(r,g,b);
            int[] colors = { System.Drawing.ColorTranslator.ToWin32(color) };
 
            SetSysColors(elements.Length, elements, colors);
            RegistryKey key = Registry.CurrentUser.OpenSubKey("Control Panel\\Colors", true);
            key.SetValue(@"Background", string.Format("{0} {1} {2}", color.R, color.G, color.B));
            key.Close();
        }
    }
}
 
'@
try
{
    Add-Type -TypeDefinition $code -ReferencedAssemblies System.Drawing.dll 
}catch{
    # An error is thrown if the type [CurrentUser.Desktop] is already created
    # so we ignore it.
}
finally
{
    [CurrentUser.Desktop]::SetBackground($R, $G, $B)
}
