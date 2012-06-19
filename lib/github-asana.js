var util = require('util');
var request = require('request');
var asana_key = process.env.ASANA_KEY
var asana_base_url = 'https://app.asana.com/api/1.0';

function getCommits(req) {
  var payload;
  if (typeof req.body.payload === 'object') {
      payload = req.body.payload;
  } else {
      payload = JSON.parse(req.body.payload);
  }
  return payload.commits;
}

function normalizeVerb(str) {
    str = str.toLowerCase(str);
    if (str == 'fixes' || str == 'fixed' || str == 'fix' || str == 'close' || str == 'closed' || str == 'closes') {
        return 'fix';
    } else if (str == 'addresses' || str == 're' || str == 'ref' || str == 'references' || str == 'see') {
        return 'see';
    } else if (str == 'breaks' || str == 'unfixes' || str == 'reopen' || str == 'reopens' || str == 're-opens' || str == 're-open') {
        return 'break';
    }
    
    throw "Unknown Verb Error";
}

function getTaskActions(commits) {
  var comments = [];
  for (var i in commits) {
    var regex = /(Fixes|Fixed|Fix|Close|Closed|Closes|Addresses|Re|Ref|Refs|References|See|Breaks|Unfixes|Reopen|Reopens|Re-opens|Re-open) #(\d+)\b/gi;
    
    var tasks=[],
    task = '';
    try {
        while (task != null) {
            task = regex.exec(commits[i].message);
            tasks.push({
                verb:normalizeVerb(task[1])
                ,id:task[2]
                ,message:commits[i].author.username + ' referenced this issue from a commit\n'+commits[i].id.slice(0,7)+' '+commits[i].message+'\n'+commits[i].url
            });
        }
    }catch(e){}

    return tasks;
  }
  return comments;
}

function sendTaskCommentsToAsana(tasks) {
  var auth = 'Basic ' + new Buffer(asana_key+":").toString('base64');
  var message = '';
  for (var i in tasks) {
    var task = tasks[i];
    if (task.verb=='see'){
    } else if (task.verb=='fix') {
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
    }
    
   request.post({
            url: asana_base_url+"/tasks/"+task.id+"/stories", 
            json: {data: {text:task.message}},
            headers: {"Authorization":auth}
          }, apiCallback);
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
