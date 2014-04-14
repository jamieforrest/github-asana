var util = require('util');
var request = require('request');
var asana_key = process.env.ASANA_KEY
var asana_base_url = 'https://app.asana.com/api/1.0';

var users;
try {
  users = JSON.parse(process.env.ASANA_USERS);
} catch (e) {
  users = [];
}

function getCommits(req) {
  return req.body.commits;
}

function normalizeVerb(str) {
    str = str.toLowerCase(str);
    if (str == 'fixing' || str == 'fixes' || str == 'fixed' || str == 'fix' || str == 'close' || str == 'closed' || str == 'closes') {
        return 'fix';
    } else if (str=='addressing' || str == 'referencing' || str == 'addresses' || str == 're' || str == 'ref' || str == 'references' || str == 'see') {
        return 'see';
    } else if (str == 'breaking' || str == 'breaks' || str == 'unfixes' || str == 'reopen' || str == 'reopens' || str == 're-opens' || str == 're-open') {
        return 'break';
    }
    
    throw "Unknown Verb Error";
}

function getTaskActions(commits) {
  var tasks=[];
  for (var i in commits) {
    var regex_verb = /(Referencing|Addressing|References|Addresses|Reopening|Re-opening|Re-opens|Breaking|Unfixes|Unfixing|Reopens|Re-open|Fixing|Closes|Closing|Closed|Breaks|Reopen|Fixed|Close|Fixes|Refs|Ref|Fix|See|Re)/i
    ,regex_id   = /(#|app\.asana\.com\/\d+\/\d+\/)(\d+)/i
    ,regex_stop = /\w(\.)/i
    ,words    = commits[i].message.split(" ")
    ,current_verb = ''
    ,current_id   = ''
    ,updated_verb_or_id = false; // used to flag when we really ought to push values to the task list

    for (var w in words) {
        var word = words[w]
        ,sub_words = word.split(","); // Retrieves words split by commas
        for (var sw in sub_words){
            // Match verbs/ids out of individual words
            var sub_word = sub_words[sw];
            var id = regex_id.exec(sub_word);
            var verb = regex_verb.exec(sub_word);
            var stop = regex_stop.exec(sub_word);
            
            if (id !== null) {
                current_id = id[2];
                updated_verb_or_id = true;
                
                // For every matched ID, we attach a 'see' task so there is always a comment (regardless of verbs)
                tasks.push({
                    author: commits[i].author.username
                    ,verb:'see'
                    ,id:current_id
                    ,message:commits[i].author.username + ' referenced this issue from a commit\n'+commits[i].id.slice(0,7)+' '+commits[i].message+'\n'+commits[i].url
                });
            } else if (verb !== null) {
                current_verb = verb[1];
                current_id = ''; // We reset the current_id here because a new verb is in play
                updated_verb_or_id = true;
            }
            
            if (current_id != '' && current_verb != '' && updated_verb_or_id) {
                if (normalizeVerb(current_verb)!='see') { // We already track every ID with a 'see' verb above
                    tasks.push({
                        author: commits[i].author.username
                        ,verb:normalizeVerb(current_verb)
                        ,id:current_id
                    });
                }
                updated_verb_or_id = false; // Don't push another element until it is unique
            }
            
            if (stop !== null) { // When we encounter a word that ends with a period, reset.
                current_verb = '',
                current_id = '',
                updated_verb_or_id = false;
            }
        }
        
    }
  }
  
  return tasks;
}

function sendTaskCommentsToAsana(tasks) {
    // change asana user depending on the commit
  var auths = {};
  for (var i = 0; i < users.length; i++) {
    auths[users[i].username] = 'Basic ' + new Buffer(users[i].key + ":").toString('base64');
  }
  var defaultAuth = 'Basic ' + new Buffer(asana_key+":").toString('base64');
  
  for (var i in tasks) {
    var task = tasks[i];
    var auth;
    if (auths[task.author])
    {
      auth = auths[task.author];
    }
    else
    {
      auth = defaultAuth;
    }
    if (task.verb=='fix') {
        request.put({
            url: asana_base_url+"/tasks/"+task.id, 
            json: {data: {completed:true}},
            headers: {"Authorization":auth}
          }, apiCallback);
    } else if (task.verb=='break') {
        request.put({
            url: asana_base_url+"/tasks/"+task.id, 
            json: {data: {completed:false}},
            headers: {"Authorization":auth}
          }, apiCallback);
    } else if (task.verb=='see') {
        request.post({
            url: asana_base_url+"/tasks/"+task.id+"/stories", 
            json: {data: {text:task.message}},
            headers: {"Authorization":auth}
          }, apiCallback);
    }
  }
}

function apiCallback (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body)
    } else {
        console.log(response.statusCode+': '+error);
        console.log(util.inspect(response.body));
    }
}

exports.index = function(req, res){
  var commits = getCommits(req);
  var actions = getTaskActions(commits);
  sendTaskCommentsToAsana(actions);
  res.send("Updated Asana.");
};
