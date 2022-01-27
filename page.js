var $ = require('jquery');
require('popper.js');
require('bootstrap');
const { ipcRenderer } = require('electron');
var Chart = require('chart.js');
var catchart;
var pcatchars = [];
var catlabels = [];

function requestCategorizationFile() {
    ipcRenderer.send('read-categories-file');
}

requestCategorizationFile();

ipcRenderer.on('categories-file-response', (event, arg) => {
    if(arg!="nofile") {

        let jfile = JSON.parse(arg);

        $("#cat-in-execution").hide();
        $("#cat-not-found").hide();
        $("#cat-results").show();

        populateCatLabels(jfile);
        populateCatChart(jfile);
        resetGCatCharts();
        populatePjCatChart($("#games-categories-wrapper"), jfile.games, "game");
        populatePjCatChart($("#nongames-categories-wrapper"), jfile.nongames, "nongame");
    }
});

function populateCatLabels(data) {
    //populate labels
    catlabels = [];
    let firstgame = data.games[ Object.keys(data.games)[0] ];
    for(i in firstgame) {
        for(j in firstgame[i]) {
            catlabels.push(j);
        }
    }    
}

function populateCatChart(data) {

    //populate games data
    let gamedata = [];
    for(i in data.games) {
        var count = 0;
        for(j in data.games[i]) {
            for(k in data.games[i][j]) {
                gamedata[ count ] = gamedata[ count ] ? gamedata[ count ]+data.games[i][j][k] : data.games[i][j][k];
                count++;
            }
        }
    }

    //find max
    let max = 1;
    for(let i=0; i<gamedata.length; i++) {
        if(gamedata[i]>max) {
            max = gamedata[i];
        }
    }

    //normalize data
    for(let i=0; i<gamedata.length; i++) {
        gamedata[i]=gamedata[i]/max;
    }

    let gameset = {
        label: 'Games',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: gamedata
    };

    //populate nongames data
    let ngamedata = [];
    for(i in data.nongames) {
        var count = 0;
        for(j in data.nongames[i]) {
            for(k in data.nongames[i][j]) {
                ngamedata[ count ] = ngamedata[ count ] ? ngamedata[ count ]+data.nongames[i][j][k] : data.nongames[i][j][k];
                count++;
            }
        }
    }

    //find max
    max = 1;
    for(let i=0; i<ngamedata.length; i++) {
        if(ngamedata[i]>max) {
            max = ngamedata[i];
        }
    }

    //normalize data
    for(let i=0; i<ngamedata.length; i++) {
        ngamedata[i]=ngamedata[i]/max;
    }

    let ngameset = {
        label: 'Non-games',
        backgroundColor: 'rgb(0, 255, 191)',
        borderColor: 'rgb(0, 255, 191)',
        data: ngamedata
    };

    var ctx = document.getElementById('categorization').getContext('2d');
    if(catchart) {
        catchart.destroy();
    }
    catchart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: catlabels,
            datasets: [gameset, ngameset]
        },
        options: {}
    });

}

function resetGCatCharts() {
    for(let i=0; i<pcatchars.length; i++) {
        pcatchars[i].destroy();
    }
    pcatchars = [];
}

function populatePjCatChart($wrp, data, idprefix) {
    $wrp.html('');
    let count = 0;
    for(i in data) {
        let phtml = $("#panel-chart").html().replace("##title##", i).replace("##chartid##", idprefix+"_"+count);
        let html = '<div class="col-md-6">'+phtml+'</div>';
        $wrp.append(html);

        //chart
        let chartdata = [];
        let labelcount = 0;
        for(j in data[i]) {
            for(k in data[i][j]) {
                chartdata[ labelcount ] = chartdata[ labelcount ] ? chartdata[ labelcount ]+data[i][j][k] : data[i][j][k];
                labelcount++;
            }
        }
        var ctx = document.getElementById(idprefix+'_'+count).getContext('2d');
        let chartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: catlabels,
                datasets: [{
                    label: i,
                    backgroundColor: 'rgb(255, 199, 0)',
                    borderColor: 'rgb(255, 199, 0)',
                    data: chartdata
                }]
            },
            options: {}
        });
        
        pcatchars.push(chartObj);

        count++;
    }
}

ipcRenderer.on('categorization-done', (event, arg) => {
    $(".launch-categorization").removeClass("disabled");
    if(arg=="done") {
        requestCategorizationFile();
    }
    else {
        $("#cat-in-execution").hide();
        $("#cat-results").hide();
        $("#cat-not-found").show();
        alert("Unexpected error while running analysis.");
    }
});

$(".launch-categorization").on("click", function() {
    $(".launch-categorization").addClass("disabled");
    ipcRenderer.send('launch-categorization');
    $("#cat-not-found").hide();
    $("#cat-in-execution").show();
});