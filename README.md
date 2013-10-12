github-asana
============

github-asana is a little web server written in node.js / express.js that integrates GitHub with Asana (the project management app).
The server listens for GitHub Post-Receive Hooks, and sends commit messages as comments in Asana Tasks.

http://asana.com/

Installation
============
You need need to set the `ASANA_KEY` environment variable to your [Asana API Key].

Once that's set, git-asana depends on express.js and require.js. To get started locally:  
* git clone https://github.com/jamieforrest/github-asana.git  
* cd github-asana  
* npm install  
* node app.js  


To run on Heroku is even easier:
* git clone https://github.com/jamieforrest/github-asana.git
* cd github-asana
* heroku create -s cedar
* git push heroku master
* heroku config:add ASANA_KEY=<your_api_key_here>

Once you have this hosted, you need to set up GitHub's Service Hook.  Go to your repositories "Admin",
then click "Service Hooks" followed by "WebHook URLs".  Add a URL for your newly hosted server.
`github-asana` responds to POST requests at the root (or `/`) of the URL where your app is hosted.

[Asana API Key]: http://developer.asana.com/documentation/#api_keys

### Multiple users & API keys

To have each developer's commit comments appear as coming from their own Asana account, you can use the ASANA_USERS evironment variable:
```
heroku config:add ASANA_USERS='[{"username":"FirstName LastName", "key":"XXXXXXXX.XXXXXXXXXXXXXXXXXX"}, {"username":"FirstName2 LastName2", "key":"XXXXXXXX.XXXXXXXXXXXXXXXXXX"}]'
```

Commit Syntax
=============
When committing, use one of the following verbs followed by an Asana task ID in your commit message (prefixed by a #):

*To mark a task as complete*
    Fix
    Fixes
    Fixed
    Fixing
    Close
    Closes
    Closed
    Closing

*To only reference a task*
    Addresses
    Addressing
    References
    Referencing
    Refs
    Ref
    Re
    See

*To mark a task as incomplete*
    Breaks
    Breaking
    Unfixes
    Unfixing
    Reopen
    Reopening
    Reopens
    Re-open
    Re-opens
    Re-opening

Commit messages may reference multiple task IDs:
    git commit -m "Fixed #123456789, breaks #5551212. References #3241"
    
Commit messages may also use any combination and order of verb and IDs...
    git commit -m "This fixed a few problems in #123,#456, and #555, also breaking #7 and #2. I suppose I should reference #99 and #98"

...as long as a verb comes before any IDs.
    git commit -m "I think #22 and #23 should be referenced" (This will not work)

The commit message will be attached to any referenced task ID, regardless of verbs or order.

The end of any sentence resets any verbs used earlier in the sentence:
    git commit -m "Fixed #123123, breaks #999. I should mention #7 too." (#7 is not broken like #999; it only receives a comment)

Task IDs in Asana are the strings of digits after the final slash in the url, visible when you're viewing a task.

Roadmap
=======
In the future, we will be adding the ability to assign tasks and add tags to tasks, with syntax such as:

    git commit -m "fixed bug #123456789 to:user@example.com tags:'in progress','feedback'"
