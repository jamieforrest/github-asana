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

function getTaskComments(commits) {
  var comments = [];
  for (var i in commits) {
    var regex = /#(\d+)\b/g;
    var tasks = commits[i].message.match(/#(\d+)\b/g);
    if (tasks) {
      for (var j in tasks) {
        comments.push({
          "id":tasks[j].slice(1),
          "text":commits[i].author.username + ' referenced this issue from a commit\n'+commits[i].id.slice(0,7)+' '+commits[i].message+'\n'+commits[i].url
        });
      }
    }
  }
  return comments;
}

function sendTaskCommentsToAsana(taskComments) {
  var auth = 'Basic ' + new Buffer(asana_key+":").toString('base64');
  for (var i in taskComments) {
    request.post({
        url: asana_base_url+"/tasks/"+taskComments[i].id+"/stories", 
        json: {data: {text:taskComments[i].text}},
        headers: {"Authorization":auth}
      }, 
      function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body)
      } else {
        console.log(response.statusCode+': '+error);
        console.log(util.inspect(response.body));
      }
    })
  }
}

exports.index = function(req, res){
  var commits = getCommits(req);
  sendTaskCommentsToAsana(getTaskComments(commits));
  res.send("Updated Asana.");
};
