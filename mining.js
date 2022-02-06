var minchart, mindimchart;
var pminchars = [];
var minlabels = [];

function requestMiningFile() {
    ipcRenderer.send('read-mining-file');
}

requestMiningFile();

ipcRenderer.on('mining-file-response', (event, arg) => {
    if(arg!="nofile") {

        let jfile = JSON.parse(arg);

        $("#min-in-execution").hide();
        $("#min-not-found").hide();
        $("#min-results").show();

        populateMinLabels(jfile);
        populateMinChart(jfile);
        populateMinDimChart(jfile);
        resetGMinCharts();
        populatePjMinChart($("#games-mining-wrapper"), jfile.games, "mingame");
        populatePjMinChart($("#nongames-mining-wrapper"), jfile.nongames, "minnongame");
    }
});

function populateMinLabels(data) {
    //populate labels
    minlabels = [];
    let firstgame = data.games[ Object.keys(data.games)[0] ];
    for(i in firstgame) {
        if(i == "Unknown") {
            continue;
        }
        minlabels.push(i);
    }    
}

function findMax(arr) {
    //find max
    let max = 1;
    for(let i=0; i<arr.length; i++) {
        if(arr[i]>max) {
            max = arr[i];
        }
    }
    return max;
}

function normalizeData(arr, max) {

    if(!max) {
        max = findMax(arr);
    }

    //normalize data
    for(let i=0; i<arr.length; i++) {
        arr[i]=arr[i]/max;
    }

    return arr;

}

function populateMinDimChart(data) {

    //populate games data
    let gamedata = [];
    for(i in data.games) {
        var count = 0;
        for(j in data.games[i]) { 
            if(j == "Unknown") {
                continue;
            }
            gamedata[ count ] = gamedata[ count ] ? gamedata[ count ]+data.games[i][j]["dimension"] : data.games[i][j]["dimension"];
            count++;
        }
    }

    //populate nongames data
    let ngamedata = [];
    for(i in data.nongames) {
        var count = 0;
        for(j in data.nongames[i]) {
            if(j == "Unknown") {
                continue;
            }
            ngamedata[ count ] = ngamedata[ count ] ? ngamedata[ count ]+data.nongames[i][j]["dimension"] : data.nongames[i][j]["dimension"];
            count++;
        }
    }

    max = findMax([...gamedata, ...ngamedata]);
    gamedata = normalizeData(gamedata, max);
    ngamedata = normalizeData(ngamedata, max);

    let ngameset = {
        label: 'Non-games',
        backgroundColor: 'rgb(0, 255, 191)',
        borderColor: 'rgb(0, 255, 191)',
        data: ngamedata,
        stack: "Nongames"
    };
    let gameset = {
        label: 'Games',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: gamedata,
        stack: "Games"
    };

    var ctx = document.getElementById('mining-dimensions').getContext('2d');
    if(mindimchart) {
        mindimchart.destroy();
    }
    mindimchart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: minlabels,
            datasets: [gameset, ngameset]
        },
        options: {}
    });

}

function populateMinChart(data) {

    //populate games data
    let gamedata = [];
    let gamebrelated = [];
    for(i in data.games) {
        var count = 0;
        for(j in data.games[i]) { 
            if(j == "Unknown") {
                continue;
            }
            gamedata[ count ] = gamedata[ count ] ? gamedata[ count ]+data.games[i][j]["total"] : data.games[i][j]["total"];
            gamebrelated[ count ] = gamebrelated[ count ] ? gamebrelated[ count ]+data.games[i][j]["bug"] : data.games[i][j]["bug"];
            count++;
        }
    }

    gamemax = findMax(gamedata);
    gamedata = normalizeData(gamedata, gamemax);
    gamebrelated = normalizeData(gamebrelated, gamemax);

    let gameset = {
        label: 'Games',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: gamedata,
        stack: "Games"
    };
    let gamebset = {
        label: 'Games - bug related',
        backgroundColor: 'rgb(255, 181, 195)',
        borderColor: 'rgb(255, 181, 195)',
        data: gamebrelated,
        stack: "Games"
    }

    //populate nongames data
    let ngamedata = [];
    let ngamebdata = [];
    for(i in data.nongames) {
        var count = 0;
        for(j in data.nongames[i]) {
            if(j == "Unknown") {
                continue;
            }
            ngamedata[ count ] = ngamedata[ count ] ? ngamedata[ count ]+data.nongames[i][j]["total"] : data.nongames[i][j]["total"];
            ngamebdata[ count ] = ngamebdata[ count ] ? ngamebdata[ count ]+data.nongames[i][j]["bug"] : data.nongames[i][j]["bug"];
            count++;
        }
    }

    ngamemax = findMax(ngamedata);
    ngamedata = normalizeData(ngamedata, ngamemax);
    ngamebdata = normalizeData(ngamebdata, ngamemax);

    let ngameset = {
        label: 'Non-games',
        backgroundColor: 'rgb(0, 255, 191)',
        borderColor: 'rgb(0, 255, 191)',
        data: ngamedata,
        stack: "Nongames"
    };
    let ngamebset = {
        label: 'Non-games - bug related',
        backgroundColor: 'rgb(150, 255, 227)',
        borderColor: 'rgb(150, 255, 227)',
        data: ngamebdata,
        stack: "Nongames"
    }

    var ctx = document.getElementById('mining').getContext('2d');
    if(minchart) {
        minchart.destroy();
    }
    minchart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: minlabels,
            datasets: [gamebset, gameset, ngamebset, ngameset]
        },
        options: {
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true
                }
            }
        }
    });

}

function resetGMinCharts() {
    for(let i=0; i<pminchars.length; i++) {
        pminchars[i].destroy();
    }
    pminchars = [];
}

function populatePjMinChart($wrp, data, idprefix) {
    $wrp.html('');
    let count = 0;
    for(i in data) {
        let phtml = $("#panel-chart").html().replace("##title##", i).replace("##chartid##", idprefix+"_"+count);
        let html = '<div class="col-md-6">'+phtml+'</div>';
        $wrp.append(html);

        //chart
        let chartdata = [];
        let chartbdata = [];
        let labelcount = 0;
        for(j in data[i]) {
            if(j == "Unknown") {
                continue;
            }
            chartdata[ labelcount ] = chartdata[ labelcount ] ? chartdata[ labelcount ]+data[i][j]["total"] : data[i][j]["total"];
            chartbdata[ labelcount ] = chartbdata[ labelcount ] ? chartbdata[ labelcount ]+data[i][j]["bug"] : data[i][j]["bug"];
            labelcount++;
        }
        var ctx = document.getElementById(idprefix+'_'+count).getContext('2d');
        let chartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: minlabels,
                datasets: [
                    {
                        label: i+" - bug related",
                        backgroundColor: 'rgb(255, 226, 132)',
                        borderColor: 'rgb(255, 226, 132)',
                        data: chartbdata
                    },
                    {
                        label: i,
                        backgroundColor: 'rgb(255, 199, 0)',
                        borderColor: 'rgb(255, 199, 0)',
                        data: chartdata
                    }
                ]
            },
            options: {
                scales: {
                    x: {
                        stacked: true,
                    }
                }
            }
        });
        
        pminchars.push(chartObj);

        count++;
    }
}

ipcRenderer.on('mining-done', (event, arg) => {
    $(".launch-mining").removeClass("disabled");
    if(arg=="done") {
        requestMiningFile();
        alert("New mining data are ready.");
    }
    else {
        $("#min-in-execution").hide();
        $("#min-results").hide();
        $("#min-not-found").show();
        alert("Unexpected error while running analysis.");
    }
});

$(".launch-mining").on("click", function() {
    $(".launch-mining").addClass("disabled");
    ipcRenderer.send('launch-mining');
    $("#min-not-found").hide();
    $("#min-in-execution").show();
});
