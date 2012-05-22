github-asana
============

github-asana is a little web server written in node.js that integrates GitHub with Asana (the project management app). 
The server listens for GitHub Post-Receive Hooks, and sends commit messages as comments in Asana Tasks.

http://asana.com/

Installation
============
To get it up and running, open up the lib/github-asana.js file and update the asana_key variable with your Asana API key. 
Then host the app somewhere (heroku is easiest) and provide the url to the app in the "Service Hooks / WebHook URLs" section of the GitHub repository you want to integrate with Asana (the app receives GitHub's POST requests at the base url or '/').

Commit Syntax
=============
For now, the only thing supported is referencing Asana task IDs in your commit messages (prefixed by a #). When you commit, write something like:

    git commit -m "fixed bug #123456789"

That will send the commit message to Asana and place it as a comment in the task with ID 123456789. 
Task IDs in Asana are the strings of digits after the final slash in the url, visible when you're viewigin a task.

Roadmap
=======
In the future, we will be adding the ability to assign tasks and add tags to tasks, with syntax such as:

    git commit -m "fixed bug #123456789 to:user@example.com tags:'in progress','feedback'"