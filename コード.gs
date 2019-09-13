
var CHANNEL_ACCESS_TOKEN = ' CHANNEL_ACCESS_TOKEN';
var GOOGLE_CLOUD_VISION_API_KEY = 'GOOGLE_CLOUD_VISION_API_KEY';


function doPost(e) {
  var type = JSON.parse(e.postData.contents).events[0].message.type;
  var reply_token = JSON.parse(e.postData.contents).events[0].replyToken;

  if (typeof reply_token === 'undefined') {
    return;
  }

  if (type !== 'image') {
    var result = 'ぼくのこと呼んだ?\n画像を送ってくれればテキストにして返信するよ-\uDBC0\uDC5E';
    message_post(reply_token, result);
    return;
  }

  var messageId = JSON.parse(e.postData.contents).events[0].message.id;
  var blob = get_line_content(messageId);
  
  var result = imageAnnotate(blob);

  message_post(reply_token, result);
  
  return;
}

function get_line_content(messageId) {
  var url = 'https://api.line.me/v2/bot/message/' + messageId + '/content';
  var blob = UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    'method': 'get'
  }); 
  return blob;
}

function imageAnnotate(file) {
  var payload = JSON.stringify({
    'requests':[
      {
        'image': {
          'content': Utilities.base64Encode(file.getBlob().getBytes())
        },
        'features': [
          {
            'type': 'TEXT_DETECTION'
          }
        ]
      }
    ]
  });

  var url = 'https://vision.googleapis.com/v1/images:annotate?key=' + GOOGLE_CLOUD_VISION_API_KEY;
  var options = {
    method : 'post',
    contentType: 'application/json', 
    payload : payload
  };

  var res = UrlFetchApp.fetch(url, options);
  var obj = JSON.parse(res.getContentText());
  
  if ('textAnnotations' in obj.responses[0]) {
    return obj.responses[0].textAnnotations[0].description;
  }
  return '文字を読み取れなかったよ。ごめんー\uDBC0\uDC5E';
}

function message_post(token, message){
  var url = 'https://api.line.me/v2/bot/message/reply';

  UrlFetchApp.fetch(url, {

    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': token,
      'messages': [{
        'type': 'text',
        'text': message
      }]
    })
  });
}
