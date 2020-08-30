$ProfileConfig = @'
Set-PSReadlineKeyHandler -Key Tab -Function Complete
Import-Module posh-git
Import-Module oh-my-posh
Set-Theme Honukai
'@

Install-Module posh-git -Scope CurrentUser
Install-Module oh-my-posh -Scope CurrentUser
$ProfileConfig -f 'string' | Out-File $PROFILE
