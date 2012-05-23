github-asana
============

github-asana is a little web server written in node.js / express.js that integrates GitHub with Asana (the project management app).
The server listens for GitHub Post-Receive Hooks, and sends commit messages as comments in Asana Tasks.

http://asana.com/

Installation
============
Nothing is required to install `github-asana`, but you need need to set the `ASANA_KEY` environment variable to
your [Asana API Key].

Once that's set, you can host this anywhere.  For example, to host with Heroku:

    git clone https://github.com/jamieforrest/github-asana.git
    cd github-asana
    heroku create -s cedar
    git push heroku master
    heroku config:add ASANA_KEY=<your_api_key_here>

Once you have this hosted, you need to set up GitHub's Service Hook.  Go to your repositories "Admin",
then click "Service Hooks" followed by "WebHook URLs".  Add a URL for your newly hosted server.
`github-asana` responds to POST requests at the root (or `/`) of the URL where your app is hosted.

[Asana API Key]: http://developer.asana.com/documentation/#api_keys


Commit Syntax
=============
For now, the only thing supported is referencing Asana task IDs in your commit messages (prefixed by a #). When you commit, write something like:

    git commit -m "fixed bug #123456789"

That will send the commit message to Asana and place it as a comment in the task with ID 123456789.
Task IDs in Asana are the strings of digits after the final slash in the url, visible when you're viewing a task.

Roadmap
=======
In the future, we will be adding the ability to assign tasks and add tags to tasks, with syntax such as:

    git commit -m "fixed bug #123456789 to:user@example.com tags:'in progress','feedback'"
