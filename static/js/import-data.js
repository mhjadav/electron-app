var app = require('electron').remote; 
var dialog = app.dialog;
var fs = require('fs');
const excelToJson = require('convert-excel-to-json');


function openFileDailog(columnToKey, callback){
    dialog.showOpenDialog(function (fileNames) {
        if(fileNames === undefined){
            console.log("No file selected");
        }else{
            //document.getElementById("actual-file").value = fileNames[0];
            const result = readFile(fileNames[0], columnToKey);
            if(callback){
                callback(result.Sheet1);
            }
        }
    }); 
}

function readFile(filepath, columnToKey) {
    const result = excelToJson({
        sourceFile: filepath,
        header:{
            rows: 1
        },
        columnToKey: columnToKey
    });
    return result;
}
