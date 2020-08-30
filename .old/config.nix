# Edit this configuration file to define what should be installed on
# your system.  Help is available in the configuration.nix(5) man page
# and in the NixOS manual (accessible by running ‘nixos-help’).

{ config, pkgs, options, ... }:

let
  unstable = import <nixos-unstable> {
    config = config.nixpkgs.config; 
  };
in {
  imports =
    [ # Include the results of the hardware scan.
      ./hardware-configuration.nix
    ];

  users = {
    defaultUserShell = pkgs.zsh;
    users.tv = {
      createHome = true;
      extraGroups = ["wheel" "video" "audio" "disk" "networkmanager" "input" "docker"];
      group = "users";
      home = "/home/tv";
      isNormalUser = true;
      uid = 1000;
    };
  };

  time.timeZone = "Europe/Moscow";

  networking = {
    hostName = "mi"; # Define your hostname.
    networkmanager.enable = true;
    firewall.enable = false;
  };

  nixpkgs = {
    config = {
      allowUnfree = true;
      packageOverrides = super: let self = super.pkgs; in
      {
        unstable = import <nixos-unstable> { 
          config = config.nixpkgs.config; 
        };
      };
    };
  };

  environment = {
    systemPackages = with pkgs; [
        firefox openvpn wget vim htop which tmux vagrant unzip 
        speedtest-cli neofetch evince dialog iptables python37 python37Packages.pip owncloud-client xbindkeys xdotool
      ]

      ++ (with unstable; [
        pycharm-professional
      ])
  };

  programs = {
    git = {
      enable = true;
      userName  = "tiulpin";
      userEmail = "viktor@tiulp.in";
    };
    zsh = {
      enable = true;
      shellAliases = {
        unalias = "type";
        nix-install = "sudo nixos-rebuild switch";
        nix-update = "sudo nixos-rebuild switch --upgrade";
      };
      ohMyZsh.enable = true;
      ohMyZsh.plugins = [ "git" "sudo" ];
      ohMyZsh.theme = "bira";
      autosuggestions.enable = true;
      syntaxHighlighting.enable = true;
    };
  }; 

  sound.enable = true;

  virtualisation = {
   docker.enable = true;
   #virtualbox.host.enable = true;
   #virtualbox.host.enableExtensionPack = true;
  }; 

  services = {
    telepathy.enable = false;
    printing.enable = true;
    sshd.enable = true;
    fwupd.enable = true;
    xserver = {
      videoDrivers = [ "intel" ];
      enable = true;
      startDbusSession = true;
      layout = "us";
      displayManager = {
        sessionCommands = ''
          ${pkgs.xlibs.xset}/bin/xset r rate 200 40
          ${pkgs.xlibs.setxkbmap}/bin/setxkbmap -layout us -option ctrl:nocaps
        '';
        lightdm = {
          enable = true;
          autoLogin = {
            enable = true;
            user = "tv";
          };
        };
      };
      desktopManager = {
        default = "i3";
        xterm.enable = false;
        xfce.enable = true;
      };
    };
  };
  system.stateVersion = "19.09";
}
