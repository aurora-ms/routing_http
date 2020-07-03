

require('dotenv').config()


const http = require('http'),
    https = require('https'),
    dotenv = require('dotenv'),
    //Como tenemos que leer un archivo, comenzaremos importando el módulo fs:
    fsp = require('fs').promises,
    fs = require('fs'),
    url = require('url'),
    mimeTypes = {
        "html": "text/html",
        "jpeg": "image/jpeg",
        "jpg": "image/jpeg",
        "ico": "image/ico",
        "png": "image/png",
        "js": "text/javascript",
        "css": "text/css"
    };

const requestListener = ((req, res) => {

    var objetourl = url.parse(req.url).pathname;
    var filename = 'finalFiles' + objetourl;

    if (filename == 'finalFiles/') {
        filename = 'finalFiles/index.html';
    }

    function error() {
        fsp.readFile(__dirname + "/finalFiles/error.html")
            .then(contents => {

                res.write(contents);
                res.end()

            })
    }

    fs.exists(filename, function (existe) {
        if (existe) {
            fsp.readFile(filename)
                .then((contentsInd) => {
                    var mimeType = mimeTypes[filename.split('.').pop()];
                    if (!mimeType) {
                        mimeType = 'text/plain';
                    }

                    res.writeHead(200, { "Content-Type": mimeType });
                    res.write(contentsInd);
                    res.end();

                })


        };
    });

    if (objetourl === '/earthquakes') {
        fsp.readFile(__dirname + "/finalFiles/earthquakes.html")
            .then(contents => {

                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.write(contents)

                const myurl = new URL('http://' + req.headers.host + req.url);
                var eleccion = myurl.searchParams.get('magnitude')

                if (!eleccion) {
                    console.error('Necesito un parámetro para afinar mis resultados');
                    error()
                } else {

                    const options = {
                        host: 'earthquake.usgs.gov',
                        path: `/earthquakes/feed/v1.0/summary/${eleccion}_hour.geojson`
                    };

                    https.get(options, response => {
                        let data = "";
                        var obg;
                        response.on("data", chunk => {
                            data += chunk;
                        });
                        response.on("end", () => {
                            obg = JSON.parse(data);

                            var getEarthData = new Promise((resolve) => {
                                let earthGlobal = "";
                                obg.features.forEach((datos) => {
                                    earthGlobal += `<div class="dataCont"><p>Magnitud: ${datos.properties.mag}</p><p>Localizacion: ${datos.properties.place}</p><p>Hora: ${new Date(datos.properties.time).toLocaleString("es-ES")} </p><p>Tipo: ${datos.properties.type}</p></div><hr>`;

                                })

                                resolve(earthGlobal)

                            })

                            getEarthData
                                .then(globalcontent => {
                                    res.write(`<main>${globalcontent}</main>`)
                                    res.end()
                                })
                                .catch(err => {
                                    console.log(`Error: ${err.message}`);
                                    process.exit(1);

                                })

                        });


                        res.on('error', e => {
                            console.log(`Error: ${e.message}`);
                            process.exit(1);
                        });




                    });
                }
            })

    } else if (objetourl === '/aboutproyect') {
        fsp.readFile(__dirname + "/finalFiles/aboutproyect.html")
            .then(contents => {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
            })

    } else if (objetourl === '/photographs') {
        fsp.readFile(__dirname + "/finalFiles/photographs.html")
            .then(contents => {
                res.setHeader("Content-Type", "text/html");
                res.writeHead(200);
                res.end(contents);
            })

    }



});

const server = http.createServer(requestListener);

server.listen(process.env.PORT, process.env.IP);

console.log(`Server running at http://${process.env.IP}:${process.env.PORT}/`);


