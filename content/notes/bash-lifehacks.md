---
date: 2021-12-10
title: Bash Lifehacks
---

### The most useful one

```bash
curl cheat.sh/<prompt>
```

### **Double Quote Your Variables**

It is generally a good practice to double quote your variables, specially user input variables where spaces are involved.

### **Use a Bash Strict Mode**


`set -euo pipefail` is short for:

```other
set -e
set -u
set -o pipefail
```

- **set-e:** forces the bash script to exit immediately if any command has a non-zero exit status.
- **set-u:** if your code has a reference to any variable that wasn’t defined previously, this will cause the program to exit.
- **set -o pipefail:** This setting prevents errors in a pipeline being masked

To be continued...