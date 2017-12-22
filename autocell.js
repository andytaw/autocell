(function(w, defaultOptions){
  
    function Location(x, y){

        var self = this;

        self.x = x;
        self.y = y;

    }

    function House(location){

        var self = this;

        self.location = location;
        self.population = 0;

        self.neighbourhood = new Neighbourhood(self);

    }

    function Neighbourhood(house){

        var self = this;

        self.position

        self.centre = house;
        self.top = null;
        self.topLeft = null;
        self.topRight = null;
        self.bottom = null;
        self.bottomLeft = null;
        self.bottomRight = null;
        self.left = null;
        self.right = null;

    }

    function Town(height, width){

        var self = this;

        self.height = height;
        self.width = width;

        self.getArea = function(){
            return self.height * self.width;
        };

        self.houses = [];

        self.findHouse = function(x, y){
            var fResults = self.houses.filter(function(house){
                return house.location.x === x && house.location.y === y;
            });
            return fResults.length === 0 ? null : fResults[0];
        };

        for(var h = 0; h < self.height; h++){
            for(var w = 0; w < self.width; w++){
                var location = new Location(h + 1, w + 1);
                var house = new House(location);
                self.houses.push(house);
            }
        };

        self.houses.forEach(function(house){
            house.neighbourhood.topLeft = self.findHouse(house.location.x-1, house.location.y-1);
            house.neighbourhood.top = self.findHouse(house.location.x, house.location.y-1);
            house.neighbourhood.topRight = self.findHouse(house.location.x+1, house.location.y-1);
            house.neighbourhood.bottomLeft = self.findHouse(house.location.x-1, house.location.y+1);
            house.neighbourhood.bottom = self.findHouse(house.location.x, house.location.y+1);
            house.neighbourhood.bottomRight = self.findHouse(house.location.x+1, house.location.y+1);
            house.neighbourhood.left = self.findHouse(house.location.x-1, house.location.y);
            house.neighbourhood.right = self.findHouse(house.location.x+1, house.location.y);
        });

        self.getPopulation = function(){
            return self.houses.reduce(function(a, b){
                if (b === null) return b;
                return b.population + a;
            }, 0);            
        };

    }

    var iCount = 0;
    var div = null;
    var tbl = null;
    var timeout = null;

    var iterate = function(town, options){

        var createContents = function(town){
            div = document.createElement('div');
            tbl = document.createElement('table');
            var html = '';
            for(var x = 1; x <= town.height; x++){
                html += '<tr>'
                for(var y = 1; y <= town.width; y++){
                    html += '<td>' + '&nbsp;' + '</td>';
                }
                html += '</tr>'
            }
            tbl.innerHTML = html;
            var target = document.getElementById('output');
            target.innerHTML = '';
            target.appendChild(div);
            target.appendChild(tbl);
        };
    
        var updateContents = function(town){
            var getColor = function(p){
                var min = 55;
                var max = 255;
                if (p === 0) return 'rgb(255,255,255)';
                if (p <= 10){
                    var scale = parseInt(max - (max - min) * (p / 10));
                    return 'rgb(' + scale +', 255, ' + scale +')';
                }
                if (p > 10 && p <= 30){
                    var scale = parseInt(max - (max - min) * (p / 30));
                    return 'rgb(' + scale +', ' + scale + ', 255)';
                } 
                if (p > 30){
                    var scale = parseInt(max - (max - min) * (p / 50));
                    return 'rgb(255, ' + scale +', ' + scale +')';
                }
                return 'rgb(0,0,0)';
            }
            if (iCount === 0) createContents(town);        
            iCount++;
            div.innerText = 'Time: ' + iCount + '. Population: ' + town.getPopulation();
            for(var x = 1; x <= town.height; x++){
                var tr = tbl.childNodes[0].childNodes[x-1];
                for(var y = 1; y <= town.width; y++){
                    var td = tr.childNodes[y-1];
                    var population = town.findHouse(x, y).population;
                    td.style.backgroundColor = getColor(population);
                }
            }
        };

        var spawn = function(town, pc){
            var num = 100 / parseFloat(pc);

            town.houses.forEach(function(house, i){
                var rnd = Math.floor(Math.random() * num);
                if (rnd === 0) {
                    house.population++;
                }
            })
        }

        var die = function(town, pc){
            var num = 100 / parseFloat(pc);

            town.houses.forEach(function(house, i){
                if (house.population === 0) return;
                var rnd = Math.floor(Math.random() * num);
                if (rnd === 0) {
                    house.population--;
                }
            })
        }

        var breed = function(town){
            town.houses.forEach(function(house, i){
                if (
                    (house.neighbourhood.top && house.neighbourhood.bottom && house.neighbourhood.top.population > 0 && house.neighbourhood.bottom.population > 0) ||
                    (house.neighbourhood.topRight && house.neighbourhood.bottomLeft && house.neighbourhood.topRight.population > 0 && house.neighbourhood.bottomLeft.population > 0) ||
                    (house.neighbourhood.topLeft && house.neighbourhood.bottomRight && house.neighbourhood.topLeft.population > 0 && house.neighbourhood.bottomRight.population > 0) ||
                    (house.neighbourhood.left && house.neighbourhood.right && house.neighbourhood.left.population > 0 && house.neighbourhood.right.population > 0)
                    ) {
                    house.population++;
                }
            })
        };

        spawn(town, options.spawnRate);
        die(town, options.dieRate);
        breed(town);

        updateContents(town);

        timeout = w.setTimeout(function(){iterate(town, options);}, 5000 / options.speed);
    };

    var start = function(){
        console.log('Start');
        w.clearTimeout(timeout);
        iCount = 0;
        div = null;
        tbl = null;
        timeout = null;
        var userOptions = {
            height: document.getElementById('height').value,
            width: document.getElementById('width').value,
            spawnRate: document.getElementById('spawnRate').value,
            dieRate: document.getElementById('dieRate').value,
            speed: document.getElementById('speed').value,
        }
        var town = new Town(userOptions.height, userOptions.width);
        iterate(town, userOptions);
    };

    window.runModel = start;

})(window, {
    width: 50,
    height: 50,
    spawnRate: 10,
    dieRate: 70,
    speed: 5
});