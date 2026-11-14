package main

import (
	"slices"
	"strings"
)

type preference struct {
	domain string
	key    string
	values []string
}

func (p preference) arguments(home string) []string {
	values := slices.Clone(p.values)
	for i, value := range values {
		values[i] = strings.ReplaceAll(value, "$HOME", home)
	}
	return append([]string{"write", p.domain, p.key}, values...)
}

// Preferences sampled from the workstation on 2026-11-13.
var preferences = []preference{
	{"NSGlobalDomain", "AppleInterfaceStyle", []string{"-string", "Dark"}},
	{"NSGlobalDomain", "AppleShowAllExtensions", []string{"-bool", "true"}},
	{"NSGlobalDomain", "AppleKeyboardUIMode", []string{"-int", "3"}},
	{"NSGlobalDomain", "ApplePressAndHoldEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "KeyRepeat", []string{"-int", "1"}},
	{"NSGlobalDomain", "InitialKeyRepeat", []string{"-int", "10"}},
	{"NSGlobalDomain", "NSAutomaticCapitalizationEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "NSAutomaticDashSubstitutionEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "NSAutomaticPeriodSubstitutionEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "NSAutomaticQuoteSubstitutionEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "NSAutomaticSpellingCorrectionEnabled", []string{"-bool", "false"}},
	{"NSGlobalDomain", "NSNavPanelExpandedStateForSaveMode", []string{"-bool", "true"}},
	{"NSGlobalDomain", "NSNavPanelExpandedStateForSaveMode2", []string{"-bool", "true"}},
	{"NSGlobalDomain", "PMPrintingExpandedStateForPrint", []string{"-bool", "true"}},
	{"NSGlobalDomain", "PMPrintingExpandedStateForPrint2", []string{"-bool", "true"}},
	{"NSGlobalDomain", "NSDocumentSaveNewDocumentsToCloud", []string{"-bool", "false"}},
	{"NSGlobalDomain", "com.apple.springing.enabled", []string{"-bool", "true"}},
	{"NSGlobalDomain", "com.apple.springing.delay", []string{"-float", "0"}},
	{"NSGlobalDomain", "AppleLanguages", []string{"-array", "en", "nl", "uk-GB"}},
	{"NSGlobalDomain", "AppleLocale", []string{"-string", "en_001@currency=eur;rg=gbzzzz"}},
	{"NSGlobalDomain", "AppleMeasurementUnits", []string{"-string", "Centimeters"}},
	{"NSGlobalDomain", "AppleMetricUnits", []string{"-bool", "true"}},
	{"com.apple.finder", "ShowStatusBar", []string{"-bool", "true"}},
	{"com.apple.finder", "ShowPathbar", []string{"-bool", "true"}},
	{"com.apple.finder", "_FXShowPosixPathInTitle", []string{"-bool", "true"}},
	{"com.apple.finder", "_FXSortFoldersFirst", []string{"-bool", "true"}},
	{"com.apple.finder", "FXDefaultSearchScope", []string{"-string", "SCcf"}},
	{"com.apple.finder", "FXEnableExtensionChangeWarning", []string{"-bool", "false"}},
	{"com.apple.finder", "FXPreferredViewStyle", []string{"-string", "Nlsv"}},
	{"com.apple.finder", "ShowExternalHardDrivesOnDesktop", []string{"-bool", "true"}},
	{"com.apple.finder", "ShowHardDrivesOnDesktop", []string{"-bool", "false"}},
	{"com.apple.finder", "ShowRemovableMediaOnDesktop", []string{"-bool", "true"}},
	{"com.apple.finder", "NewWindowTarget", []string{"-string", "PfDe"}},
	{"com.apple.finder", "NewWindowTargetPath", []string{"-string", "file://$HOME/Desktop/"}},
	{"com.apple.dock", "tilesize", []string{"-float", "40"}},
	{"com.apple.dock", "autohide", []string{"-bool", "true"}},
	{"com.apple.dock", "autohide-delay", []string{"-float", "0.15"}},
	{"com.apple.dock", "autohide-time-modifier", []string{"-float", "0.15"}},
	{"com.apple.dock", "mineffect", []string{"-string", "scale"}},
	{"com.apple.dock", "show-process-indicators", []string{"-bool", "true"}},
	{"com.apple.dock", "show-recents", []string{"-bool", "false"}},
	{"com.apple.dock", "mru-spaces", []string{"-bool", "false"}},
	{"com.apple.dock", "showhidden", []string{"-bool", "true"}},
	{"com.apple.dock", "wvous-tl-corner", []string{"-int", "2"}},
	{"com.apple.dock", "wvous-tr-corner", []string{"-int", "4"}},
	{"com.apple.dock", "wvous-bl-corner", []string{"-int", "5"}},
	{"com.apple.dock", "wvous-br-corner", []string{"-int", "14"}},
	{"com.apple.dock", "wvous-tl-modifier", []string{"-int", "0"}},
	{"com.apple.dock", "wvous-tr-modifier", []string{"-int", "0"}},
	{"com.apple.dock", "wvous-bl-modifier", []string{"-int", "0"}},
	{"com.apple.desktopservices", "DSDontWriteNetworkStores", []string{"-bool", "true"}},
	{"com.apple.desktopservices", "DSDontWriteUSBStores", []string{"-bool", "true"}},
	{"com.apple.AppleMultitouchTrackpad", "Clicking", []string{"-bool", "true"}},
	{"com.apple.AppleMultitouchTrackpad", "TrackpadRightClick", []string{"-bool", "true"}},
	{"com.apple.AppleMultitouchTrackpad", "TrackpadCornerSecondaryClick", []string{"-int", "0"}},
	{"com.apple.AppleMultitouchTrackpad", "TrackpadThreeFingerDrag", []string{"-bool", "false"}},
	{"com.apple.driver.AppleBluetoothMultitouch.trackpad", "Clicking", []string{"-bool", "true"}},
	{"com.apple.driver.AppleBluetoothMultitouch.trackpad", "TrackpadRightClick", []string{"-bool", "true"}},
	{"com.apple.driver.AppleBluetoothMultitouch.trackpad", "TrackpadCornerSecondaryClick", []string{"-int", "2"}},
	{"com.apple.driver.AppleBluetoothMultitouch.trackpad", "TrackpadThreeFingerDrag", []string{"-bool", "false"}},
	{"com.apple.screencapture", "type", []string{"-string", "png"}},
	{"com.apple.ActivityMonitor", "OpenMainWindow", []string{"-bool", "true"}},
	{"com.apple.ActivityMonitor", "IconType", []string{"-int", "5"}},
	{"com.apple.ActivityMonitor", "ShowCategory", []string{"-int", "100"}},
	{"com.apple.ActivityMonitor", "SortColumn", []string{"-string", "CPUUsage"}},
	{"com.apple.ActivityMonitor", "SortDirection", []string{"-int", "0"}},
	{"com.apple.Terminal", "SecureKeyboardEntry", []string{"-bool", "true"}},
	{"com.apple.Terminal", "ShowLineMarks", []string{"-int", "0"}},
}
