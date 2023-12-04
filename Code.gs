const assignmentsSheetName = "Assignments"
const completedAssignmentsSheetName = "Completed Assignments"
const firstColumnTitle = "Assignments";
const lastPublishRow = "E28";
const timeZone = "GMT+2";

// TELEGRAM SETTINGS
const CHAT_ID = "-0000000000000";
const BOT_TOKEN = "0000000000:AAAAAAAaAaaAAaAa_aa_aaAAaAAaAaaa-AA";

function sendMessage(CONTENT){
  var data = {
    "disable_web_page_preview": true,
    "chat_id" : CHAT_ID,
    "parse_mode" : "markdown",
    "text" : CONTENT,
  };
  var payload = JSON.stringify(data);
  var options = {
    "method" : "GET",
    "contentType" : "application/json",
    "payload" : payload
  };
  UrlFetchApp.fetch("https://api.telegram.org/bot"+ BOT_TOKEN +"/sendMessage", options);
}

function getAssignments(){
  var sheet = SpreadsheetApp.getActive().getSheetByName(assignmentsSheetName);
  var last_publish = sheet.getRange(lastPublishRow).getValue();
  var date = new Date();
  try {
    if (Utilities.formatDate(date, timeZone, 'dd/MM/YY') == Utilities.formatDate(last_publish, timeZone, 'dd/MM/YY')) {
      Browser.msgBox("A notification was sent recently. Please try again later! ( ͡° ͜ʖ ͡°)");
      return;
    }
  } catch(error){
    
  }
  var data = sheet.getDataRange().getValues();
  var CONTENT = "📣 Current #Assignments:\n\n";
  data.forEach(function (row) {
    if (row[0] != "" && row[0] != firstColumnTitle && row[4] != "") {
      if (parseInt(row[4]) < 2) {
        CONTENT += "🔴 "
      } else if (parseInt(row[4]) < 4) {
        CONTENT += "🟡 "
      } else {
        CONTENT += "🟢 "
      }

      var DATE = Utilities.formatDate(row[3], timeZone, 'dd/MM hh:mm a');
      if (row[2]) {
        if (row[2].includes('http')) {
          var SUBMISSION_URL = "[(Form)]("+row[2]+")";
        } else {
          var SUBMISSION_URL = "("+row[2]+")";
        }
      } else {
        var SUBMISSION_URL = "";
      }
      
      if (row[1]){
        var TITLE = "["+row[0]+"]("+row[1]+")";
      } else {
        var TITLE = row[0];
      }
      CONTENT +=  TITLE + ": _" + DATE + "_ " + SUBMISSION_URL
      CONTENT += '\n'
    }
  });
  CONTENT += "\nFor More Information: http://bit.ly/3ZLPjED";
  sendMessage(CONTENT);
  var date = new Date();
  sheet.getRange(lastPublishRow).setValue(Utilities.formatDate(date, timeZone, 'MM/dd/YY'));
}

function getWeeklyPostLinks(){
  var sheet = SpreadsheetApp.getActive().getSheetByName("WeeklyPost");
  var data = sheet.getDataRange().getValues();
  var CONTENT = "📣 Recap of Weekly Post:\n";
  data.forEach(function (row) {
    if (row[0] != "Subject"){
      POST_LINK = "[(Telegram Link)]("+row[1]+")";
      CONTENT += row[0] + " " + POST_LINK + "\n"
    }
  });
  sendMessage(CONTENT);
}

function moveToDB(){
  var assignments_sheet = SpreadsheetApp.getActive().getSheetByName(assignmentsSheetName);
  var database_sheet = SpreadsheetApp.getActive().getSheetByName(completedAssignmentsSheetName);
  var data = assignments_sheet.getDataRange().getValues();
  var idx = 1;
  data.forEach(function (row) {
    if (row[0] != "" && row[4] == 0){
      database_sheet.appendRow([row[0], row[1], row[2], row[3]]);
      assignments_sheet.getRange(idx, 1, 1, assignments_sheet.getLastColumn()).clearContent();
      if (idx == 25) {return};
    }
    idx += 1;
  });
}