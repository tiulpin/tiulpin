---
title: My keyboard and Raycast setup
date: 2026-11-17
draft: false
tags:
  - keyboard
  - macos
  - raycast
description: My NuPhy Air60 V2 layout for Raycast and CleanShot X on macOS.
translationKey: notes/nuphy-raycast
---

The [Raycast keyboard](https://www.raycast.com/keyboard) was sold out when I looked, so I had to act :D I mapped the Fn layer on my NuPhy Air60 V2 to the Raycast commands I use.

[Raycast's setup video](https://www.youtube.com/watch?v=_5GzlVJr6QU&t=44s) uses a side key for Clipboard History. On my Air60 I use Fn+V.

## Setup

1. Put the Air60 V2 in Mac and wired mode. Connect it over USB and open [VIA](https://usevia.app/) in Chrome or Edge. If VIA doesn't recognize it, load the [Air60 V2 definition](https://nuphy.com/pages/json-files-for-nuphy-keyboards).
2. Select **layer 1** (Mac Fn). Click a key, choose **Any**, and enter its VIA keycode from the table. For V, that's `HYPR(KC_V)`. Holding Fn and pressing V now sends Ctrl+Option+Shift+Command+V.
3. In Raycast Settings, find **Clipboard History**, click its hotkey field, and press Fn+V. Repeat for the commands you want. My launcher uses Cmd+Space, and [Color Picker](https://www.raycast.com/thomas/color-picker) and [Ruler](https://www.raycast.com/anwarulislam/ruler) come from the Raycast Store.

| Command                | Physical shortcut | VIA keycode     |
| ---------------------- | ----------------- | --------------- |
| Open Raycast           | Fn+Space          | `LGUI(KC_SPC)`  |
| Pick Color             | Fn+Y              | `HYPR(KC_Y)`    |
| Ruler                  | Fn+B              | `HYPR(KC_B)`    |
| Clipboard History      | Fn+V              | `HYPR(KC_V)`    |
| Search Emoji & Symbols | Fn+I              | `HYPR(KC_E)`    |
| Search Files           | Fn+F              | `HYPR(KC_F)`    |
| Raycast Notes          | Fn+N              | `HYPR(KC_N)`    |
| Search Snippets        | Fn+S              | `HYPR(KC_S)`    |
| Search Screenshots     | Fn+P              | `HYPR(KC_P)`    |
| Start Focus Session    | Fn+O              | `HYPR(KC_O)`    |
| Calculator History     | Fn+C              | `HYPR(KC_C)`    |
| My Schedule            | Fn+A              | `HYPR(KC_A)`    |
| Search Menu Bar Items  | Fn+T              | `HYPR(KC_M)`    |
| Switch Windows         | Fn+U              | `HYPR(KC_W)`    |
| Left Half              | Fn+H              | `HYPR(KC_LEFT)` |
| Restore                | Fn+J              | `HYPR(KC_DOWN)` |
| Maximize               | Fn+K              | `HYPR(KC_UP)`   |
| Right Half             | Fn+L              | `HYPR(KC_RGHT)` |

Fn+E switches wireless devices, so I put emoji on Fn+I. On my laptop I use Right Command+E for the same command. I set **Right Command** as my Hyper key in **Raycast Settings > Keyboard** with **Include Shift** on.

## CleanShot X

I bind these in CleanShot X. Fn+Backspace brings up the capture menu. Fn+X is for copying an error message out of a screenshot so I can paste it as one line.

| CleanShot action                   | Physical shortcut | VIA keycode  | Hotkey in CleanShot |
| ---------------------------------- | ----------------- | ------------ | ------------------- |
| All-in-One                         | Fn+Backspace      | `LSG(KC_5)`  | Cmd+Shift+5         |
| Capture Area                       | Fn+Enter          | `LSG(KC_4)`  | Cmd+Shift+4         |
| Capture Fullscreen                 | Fn+Delete         | `LSG(KC_3)`  | Cmd+Shift+3         |
| Recognize text without line breaks | Fn+X              | `HYPR(KC_X)` | Hyper+X             |
