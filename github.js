let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");
let $;
let data = {};
request("https://github.com/topics", getTopicPage);
function getTopicPage(err, res, body){
    // get Three Topics on github.com/topics
    if(err){
        console.log("ERROR @ getTopic page");
        console.log(err);
        return;
    }
    $ = cheerio.load(body);
    let allTopicAnchors = $(
        ".no-underline.d-flex.flex-column.flex-justify-center"
    );
    let allTopicNames = $(
        ".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1"
    );

    for(let i=0; i<allTopicAnchors.length; i++){
        getAllProjects(
            "https://github.com/"+ $(allTopicAnchors[i]).attr("href"),
            $(allTopicNames[i]).text().trim()
        );
    }
}
function getAllProjects(url, name){
    // get upto 8 projects from a given project url
    // url->project url 
    // name -> project name
    request(url, function(err, res, body){
        $ = cheerio.load(body);
        let allProjects = $(
            ".f3.color-text-secondary.text-normal .text-bold"
        );
        if(allProjects.length>8){
            allProjects = allProjects.slice(0, 8);
        }
        for(let i=0; i<allProjects.length; i++){
            let projectUrl = "https://github.com"+
            $(allProjects[i]).attr("href");
            let projectName = $(allProjects[i]).text().trim();
            console.log(projectUrl);
            console.log(projectName);

            if(!data[name]){
                data[name] = [{projectName, projectUrl}];
            }else{
                data[name].push({projectName, projectUrl});
            }
            // fs.writeFileSync("data.json", JSON.stringify(data));
            getIssues(projectUrl, name, projectName);
        }
    });
}

function getIssues(url, topicName, projectName){
    request(url+"/issues" ,function(err,res, body){
        $ = cheerio.load(body);
        let allIssues = $(
            ".Link--primary.v-align-middle.no-underline.h4,js-navigation-open markdown-title"
        );

        for(let i=0; i<allIssues.length; i++){
            let IssueTitle = $(allIssues[i]).text().trim();
            let IssueUrl = "https://github.com" + $(allIssues[i]).attr("href");
            
            let idx = data[topicName].findIndex(function(e){
                return e.projectName == projectName
            });

            if(!data[topicName][idx].issues){
                data[topicName][idx].issues = [{IssueTitle, IssueUrl}];
            }else{
                data[topicName][idx].issues.push({IssueTitle, IssueUrl});
            }
        }
        fs.writeFileSync("data.json", JSON.stringify(data));
    });
}