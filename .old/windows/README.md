```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
choco install apps.config --ignorechecksum -y
.\Background_set.ps1
.\Console_config.ps1
.\Default.cmd
```