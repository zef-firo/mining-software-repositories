var minchart;
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
        minlabels.push(i);
    }    
}

function populateMinChart(data) {

    //populate games data
    let gamedata = [];
    for(i in data.games) {
        var count = 0;
        for(j in data.games[i]) {
            gamedata[ count ] = gamedata[ count ] ? gamedata[ count ]+data.games[i][j] : data.games[i][j];
            count++;
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
            ngamedata[ count ] = ngamedata[ count ] ? ngamedata[ count ]+data.nongames[i][j] : data.nongames[i][j];
            count++;
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

    var ctx = document.getElementById('mining').getContext('2d');
    if(minchart) {
        minchart.destroy();
    }
    minchart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: minlabels,
            datasets: [gameset, ngameset]
        },
        options: {}
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
        let labelcount = 0;
        for(j in data[i]) {
            chartdata[ labelcount ] = chartdata[ labelcount ] ? chartdata[ labelcount ]+data[i][j] : data[i][j];
            labelcount++;
        }
        var ctx = document.getElementById(idprefix+'_'+count).getContext('2d');
        let chartObj = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: minlabels,
                datasets: [{
                    label: i,
                    backgroundColor: 'rgb(255, 199, 0)',
                    borderColor: 'rgb(255, 199, 0)',
                    data: chartdata
                }]
            },
            options: {}
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
